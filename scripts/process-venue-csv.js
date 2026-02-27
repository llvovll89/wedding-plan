/**
 * process-venue-csv.js
 *
 * scripts/venue-data/ 폴더에 있는 CSV 파일들을 읽어서
 * src/data/venues.json 으로 합산 출력합니다.
 *
 * 사용법:
 *   node scripts/process-venue-csv.js   (또는 npm run venues)
 *
 * ★ 권장: 전국 통합 표준데이터 한 번에 다운로드
 *   https://www.data.go.kr/data/15155669/standard.do
 *   → 로그인 후 CSV/Excel 다운로드 → scripts/venue-data/ 에 저장
 *   (대구, 서울 등 전국 데이터가 한 파일에 포함됩니다)
 *
 * 또는: 지역별 파일데이터 개별 다운로드 후 여러 개 넣어도 됩니다.
 *
 * 인코딩 주의:
 *   - 파일이 EUC-KR 인코딩이면 UTF-8로 변환 후 실행하세요.
 *   - Windows: Excel에서 "다른 이름으로 저장" → CSV UTF-8(BOM 포함)
 *   - Mac/Linux: iconv -f EUC-KR -t UTF-8 input.csv > output.csv
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = join(__dirname, 'venue-data');
const OUTPUT_FILE = join(__dirname, '..', 'src', 'data', 'venues.json');

// 가능한 컬럼명 매핑
// - 전국표준데이터(15155669): 사업장명, 시도명, 시군구명, 소재지도로명주소, 전화번호, 영업상태명
// - 지자체 개별 파일: 시설명, 도로명주소, 전화번호 등
const NAME_COLS    = ['사업장명', '시설명', '업소명', '업체명', '명칭', '시설명칭', '예식장명'];
const ADDR_COLS    = ['소재지도로명주소', '도로명주소', '소재지(도로명)', '주소', '소재지', '도로명 주소', '도로명'];
const PHONE_COLS   = ['전화번호', '연락처', '전화', '전화번호1', '대표전화'];
// 표준데이터의 시도명 컬럼 (있으면 주소 파싱보다 우선 사용)
const REGION_COLS  = ['시도명'];
// 폐업 등 제외할 영업상태
const CLOSED_STATUS = new Set(['폐업', '폐업취소', '영업취소', '말소']);

/** BOM 제거 후 UTF-8로 파싱 */
function readCsvUtf8(filePath) {
    let raw = readFileSync(filePath, 'utf-8');
    // UTF-8 BOM 제거
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return raw;
}

/** 간단한 CSV 파서 (큰따옴표 필드 지원) */
function parseCsv(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length < 2) return [];

    const parseRow = (line) => {
        const fields = [];
        let field = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                fields.push(field.trim());
                field = '';
            } else {
                field += ch;
            }
        }
        fields.push(field.trim());
        return fields;
    };

    const headers = parseRow(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseRow(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => { obj[h.trim()] = values[idx] ?? ''; });
        rows.push(obj);
    }
    return rows;
}

/** 여러 후보 컬럼 중 첫 번째로 값이 있는 것 반환 */
function getCol(row, candidates) {
    for (const col of candidates) {
        if (row[col] !== undefined && row[col] !== '') return row[col];
    }
    return '';
}

/** 주소 첫 단어에서 시도 추출 */
function extractRegion(address) {
    if (!address) return '기타';
    const first = address.trim().split(/\s+/)[0];
    // 표준 시도명 → 짧은 이름으로 매핑
    const MAP = {
        '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
        '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
        '울산광역시': '울산', '세종특별자치시': '세종',
        '경기도': '경기', '강원도': '강원', '강원특별자치도': '강원',
        '충청북도': '충북', '충청남도': '충남',
        '전라북도': '전북', '전북특별자치도': '전북', '전라남도': '전남',
        '경상북도': '경북', '경상남도': '경남',
        '제주특별자치도': '제주',
    };
    return MAP[first] || first || '기타';
}

// ─── 메인 로직 ──────────────────────────────────────────

let files;
try {
    files = readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.csv'));
} catch {
    console.error(`❌ 폴더를 찾을 수 없어요: ${INPUT_DIR}`);
    console.error('   scripts/venue-data/ 폴더를 만들고 CSV 파일을 넣어주세요.');
    process.exit(1);
}

if (files.length === 0) {
    console.warn('⚠️  venue-data/ 폴더에 CSV 파일이 없어요.');
    console.warn('   data.go.kr 에서 예식장 CSV를 다운로드 후 넣어주세요.');
    process.exit(0);
}

const allVenues = [];
const seen = new Set(); // 중복 제거용 (시설명+주소)

for (const file of files) {
    const filePath = join(INPUT_DIR, file);
    console.log(`📄 처리 중: ${file}`);

    let rows;
    try {
        const text = readCsvUtf8(filePath);
        rows = parseCsv(text);
    } catch (err) {
        console.warn(`   ⚠️  파싱 실패 (${err.message}), 건너뜀`);
        continue;
    }

    let count = 0;
    let skipped = 0;
    for (const row of rows) {
        const name    = getCol(row, NAME_COLS);
        const address = getCol(row, ADDR_COLS);
        const phone   = getCol(row, PHONE_COLS);
        const status  = row['영업상태명'] ?? '';

        if (!name) continue;

        // 폐업 업체 제외
        if (CLOSED_STATUS.has(status.trim())) { skipped++; continue; }

        const key = `${name}|${address}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // 시도명 컬럼이 있으면 우선 사용, 없으면 주소에서 추출
        const rawRegion = getCol(row, REGION_COLS) || address;
        allVenues.push({
            name,
            address,
            phone,
            region: extractRegion(rawRegion),
        });
        count++;
    }
    if (skipped > 0) console.log(`   (폐업 ${skipped}개 제외)`);
    console.log(`   ✅ ${count}개 추가 (누계: ${allVenues.length}개)`);
}

// 지역-이름 순 정렬
allVenues.sort((a, b) => {
    if (a.region < b.region) return -1;
    if (a.region > b.region) return 1;
    return a.name.localeCompare(b.name, 'ko');
});

// src/data/ 폴더 생성 (없을 경우)
mkdirSync(join(__dirname, '..', 'src', 'data'), { recursive: true });
writeFileSync(OUTPUT_FILE, JSON.stringify(allVenues, null, 2), 'utf-8');

console.log(`\n🎉 완료! 총 ${allVenues.length}개 예식장 → ${OUTPUT_FILE}`);
