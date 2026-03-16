import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppNav } from "../../components/layout/AppNav";
import { useAuth } from "../../context/auth/AuthContext";
import { useSettings } from "../../context/settings/SettingsContext";
import { saveInvitationConfig, getInvitationConfig } from "../../firebase/invitationService";
import type { InvitationConfig } from "../../types/invitation";
import { DEFAULT_INVITATION_CONFIG } from "../../types/invitation";
import { SETTINGS } from "../../routes/route";

const INVITATION_BASE_URL = "https://kimgeonho-wedding.vercel.app";

const TEMPLATES: { id: InvitationConfig["templateId"]; name: string; desc: string; bg: string }[] = [
  { id: "1", name: "클래식", desc: "우아하고 전통적인", bg: "from-stone-100 to-amber-100" },
  { id: "2", name: "모던", desc: "깔끔하고 세련된", bg: "from-slate-100 to-slate-200" },
  { id: "3", name: "로맨틱", desc: "따뜻하고 감성적인", bg: "from-rose-50 to-pink-100" },
];

function SectionTitle({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
        {desc && <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>}
      </div>
    </div>
  );
}

export function Invitation() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [config, setConfig] = useState<InvitationConfig>(DEFAULT_INVITATION_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const invitationUrl = user
    ? `${INVITATION_BASE_URL}/?uid=${user.uid}&t=${config.templateId}`
    : "";

  useEffect(() => {
    if (!user) return;
    getInvitationConfig(user.uid)
      .then((data) => {
        if (data) setConfig(data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const update = (patch: Partial<InvitationConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveInvitationConfig(user.uid, {
        ...config,
        groomName: settings.groomName,
        brideName: settings.brideName,
        weddingDate: settings.weddingDate,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10";

  const readonlyClass =
    "w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-base sm:text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppNav />
        <div className="flex items-center justify-center pt-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppNav />
      <main className="mx-auto max-w-xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">내 청첩장</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            정보를 입력하고 저장하면 청첩장 링크가 자동으로 업데이트돼요.
          </p>
        </div>

        <div className="space-y-4">
          {/* 공개 링크 */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 dark:border-rose-900/30 dark:bg-rose-900/10">
            <p className="mb-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              공개 청첩장 링크
            </p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 truncate rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-rose-800/50 dark:bg-slate-800 dark:text-slate-400">
                {invitationUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-xl bg-rose-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-600"
              >
                {copied ? "✓ 복사됨" : "복사"}
              </button>
              <a
                href={invitationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800/50 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
              >
                미리보기
              </a>
            </div>
          </div>

          {/* 템플릿 선택 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <SectionTitle icon="🎨" title="템플릿 선택" desc="하객에게 보여질 디자인을 골라요." />
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ templateId: t.id })}
                  className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                    config.templateId === t.id
                      ? "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-900/20"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700/50"
                  }`}
                >
                  <div
                    className={`mb-2 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br ${t.bg}`}
                  >
                    <span className="text-xl">💌</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-tight text-slate-400 dark:text-slate-500">
                    {t.desc}
                  </p>
                  {config.templateId === t.id && (
                    <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500">
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <SectionTitle icon="💍" title="기본 정보" desc="이름·날짜는 설정 페이지에서 관리해요." />
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  신랑 이름
                </label>
                <div className={readonlyClass}>{settings.groomName || "—"}</div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  신부 이름
                </label>
                <div className={readonlyClass}>{settings.brideName || "—"}</div>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  결혼 날짜
                </label>
                <div className={readonlyClass}>{settings.weddingDate || "—"}</div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  예식 시간
                </label>
                <input
                  type="time"
                  className={inputClass}
                  value={config.weddingTime}
                  onChange={(e) => update({ weddingTime: e.target.value })}
                />
              </div>
            </div>
            <Link
              to={SETTINGS}
              className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400"
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8M6 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              설정에서 이름·날짜 변경
            </Link>
          </div>

          {/* 예식장 정보 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <SectionTitle icon="🏛️" title="예식장 정보" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    예식장 이름
                  </label>
                  <input
                    className={inputClass}
                    placeholder="그랜드 웨딩홀"
                    value={config.venueName}
                    onChange={(e) => update({ venueName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    홀 이름
                  </label>
                  <input
                    className={inputClass}
                    placeholder="로즈홀"
                    value={config.hallName}
                    onChange={(e) => update({ hallName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  주소
                </label>
                <input
                  className={inputClass}
                  placeholder="서울특별시 강남구 테헤란로 123"
                  value={config.address}
                  onChange={(e) => update({ address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 가족 정보 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <SectionTitle
              icon="👨‍👩‍👧‍👦"
              title="가족 정보"
              desc="청첩장에 표시될 부모님 정보예요."
            />
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  신랑측
                </p>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                      아버지 성함
                    </label>
                    <input
                      className={inputClass}
                      placeholder="홍아버지"
                      value={config.groomFatherName}
                      onChange={(e) => update({ groomFatherName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                      어머니 성함
                    </label>
                    <input
                      className={inputClass}
                      placeholder="홍어머니"
                      value={config.groomMotherName}
                      onChange={(e) => update({ groomMotherName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    신랑 연락처
                  </label>
                  <input
                    className={inputClass}
                    placeholder="010-0000-0000"
                    value={config.groomPhone}
                    onChange={(e) => update({ groomPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  신부측
                </p>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                      아버지 성함
                    </label>
                    <input
                      className={inputClass}
                      placeholder="김아버지"
                      value={config.brideFatherName}
                      onChange={(e) => update({ brideFatherName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                      어머니 성함
                    </label>
                    <input
                      className={inputClass}
                      placeholder="김어머니"
                      value={config.brideMotherName}
                      onChange={(e) => update({ brideMotherName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    신부 연락처
                  </label>
                  <input
                    className={inputClass}
                    placeholder="010-1111-1111"
                    value={config.bridePhone}
                    onChange={(e) => update({ bridePhone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 교통 정보 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <SectionTitle icon="🚇" title="교통 정보" desc="지하철·버스·주차 정보를 입력해요." />
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  지하철
                </label>
                <input
                  className={inputClass}
                  placeholder="2호선 강남역 3번출구 도보 5분"
                  value={config.subway}
                  onChange={(e) => update({ subway: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  버스
                </label>
                <input
                  className={inputClass}
                  placeholder="146, 340, 360번"
                  value={config.bus}
                  onChange={(e) => update({ bus: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  주차
                </label>
                <input
                  className={inputClass}
                  placeholder="B1-B3 주차장, 3시간 무료"
                  value={config.parking}
                  onChange={(e) => update({ parking: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 계좌 정보 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <SectionTitle icon="💳" title="계좌 정보" desc="축의금 계좌를 입력해요." />
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  신랑 계좌
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="신한은행"
                    value={config.groomBank}
                    onChange={(e) => update({ groomBank: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="110-123-456789"
                    value={config.groomAccount}
                    onChange={(e) => update({ groomAccount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  신부 계좌
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="카카오뱅크"
                    value={config.brideBank}
                    onChange={(e) => update({ brideBank: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="3333-01-123456"
                    value={config.brideAccount}
                    onChange={(e) => update({ brideAccount: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {saving ? "저장 중..." : saved ? "✓  저장됐어요!" : "저장하기"}
        </button>
      </main>
    </div>
  );
}
