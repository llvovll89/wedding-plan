import { useEffect, useState } from "react";
import { useSettings } from "../../context/settings/SettingsContext";
import { AppNav } from "../../components/layout/AppNav";
import { Select } from "../../components/ui/Select";
import { DatePicker } from "../../components/ui/DatePicker";
import { REGIONS } from "../../types/settings";

function formatKRW(n: number) {
    return n > 0 ? `${n.toLocaleString("ko-KR")}원` : "";
}

function toDisplay(n: number | ""): string {
    if (n === "") return "";
    return (n as number).toLocaleString("ko-KR");
}

function parseInput(s: string): number | "" {
    const digits = s.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return Number(digits);
}


function SectionTitle({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
            </div>
        </div>
    );
}


export const SettingsPage = () => {
    const { settings, updateSettings } = useSettings();

    const [groomName, setGroomName] = useState(settings.groomName);
    const [brideName, setBrideName] = useState(settings.brideName);
    const [weddingDate, setWeddingDate] = useState(settings.weddingDate);
    const [region, setRegion] = useState(settings.region);
    const [guestCount, setGuestCount] = useState<number | "">(settings.guestCount || "");
    const [mealCostPerPerson, setMealCostPerPerson] = useState<number | "">(settings.mealCostPerPerson || "");
    const [totalBudget, setTotalBudget] = useState<number | "">(settings.totalBudget || "");
    const [saved, setSaved] = useState(false);


    useEffect(() => {
        setGroomName(settings.groomName);
        setBrideName(settings.brideName);
        setWeddingDate(settings.weddingDate);
        setRegion(settings.region);
        setGuestCount(settings.guestCount || "");
        setMealCostPerPerson(settings.mealCostPerPerson || "");
        setTotalBudget(settings.totalBudget || "");
    }, [settings]);

    const handleSave = () => {
        updateSettings({
            groomName: groomName.trim(),
            brideName: brideName.trim(),
            weddingDate,
            region,
            guestCount: guestCount === "" ? 0 : guestCount,
            mealCostPerPerson: mealCostPerPerson === "" ? 0 : mealCostPerPerson,
            totalBudget: totalBudget === "" ? 0 : totalBudget,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // 결혼일까지 D-day
    const dDayText = (() => {
        if (!weddingDate) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const wedding = new Date(weddingDate); wedding.setHours(0, 0, 0, 0);
        const diff = Math.round((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "오늘이 결혼식이에요!";
        if (diff > 0) return `결혼식까지 ${diff}일 남았어요`;
        return `결혼식이 ${Math.abs(diff)}일 지났어요`;
    })();

    const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <main className="mx-auto max-w-xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">내 설정</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">결혼 정보와 예산을 등록해두세요.</p>
                </div>

                <div className="space-y-4">
                    {/* 우리의 결혼 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <SectionTitle
                            icon="💍"
                            title="우리의 결혼"
                            desc="기본 정보를 등록하면 앱 곳곳에서 활용돼요."
                        />

                        {/* 신랑 / 신부 */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">신랑 이름</label>
                                <input
                                    className={inputClass}
                                    placeholder="홍길동"
                                    value={groomName}
                                    onChange={(e) => setGroomName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">신부 이름</label>
                                <input
                                    className={inputClass}
                                    placeholder="김영희"
                                    value={brideName}
                                    onChange={(e) => setBrideName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 결혼 예정일 */}
                        <div className="mb-3">
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">결혼 예정일</label>
                            <DatePicker
                                value={weddingDate}
                                onChange={setWeddingDate}
                                placeholder="날짜를 선택해주세요"
                            />
                            {dDayText && (
                                <p className="mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">{dDayText}</p>
                            )}
                        </div>

                        {/* 지역 / 하객 수 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">예식 지역</label>
                                <Select
                                    value={region}
                                    onValueChange={setRegion}
                                    options={[
                                        { value: "", label: "선택 안 함" },
                                        ...REGIONS.map((r) => ({ value: r, label: r })),
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">예상 하객 수</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="200"
                                        className={`${inputClass} pr-8`}
                                        value={toDisplay(guestCount)}
                                        onChange={(e) => setGuestCount(parseInput(e.target.value))}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">명</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 예산 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <SectionTitle
                            icon="💰"
                            title="예산"
                            desc="플랜 항목의 예상 비용을 총 예산에서 차감해 보여줘요."
                        />

                        <div className="mb-3">
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">결혼 총 예산</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="30,000,000"
                                    className={`${inputClass} pr-8`}
                                    value={toDisplay(totalBudget)}
                                    onChange={(e) => setTotalBudget(parseInput(e.target.value))}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                            </div>
                            {totalBudget !== "" && totalBudget > 0 && (
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    = <span className="font-semibold text-slate-700 dark:text-slate-300">{formatKRW(totalBudget)}</span>
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                1인 식대
                                <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">(게스트 리스트 식대 계산에 사용)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="65,000"
                                    className={`${inputClass} pr-8`}
                                    value={toDisplay(mealCostPerPerson)}
                                    onChange={(e) => setMealCostPerPerson(parseInput(e.target.value))}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <button
                    type="button"
                    onClick={handleSave}
                    className="mt-6 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                    {saved ? "✓  저장됐어요!" : "저장하기"}
                </button>

            </main>
        </div>
    );
};
