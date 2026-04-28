import { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { brandsData } from "../../Components/BrandsData";
import { BackIcon } from "../../Icons/BackIcon";

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
);

const colors = [
    { value: "#1A1A1A", label: "أسود" },
    { value: "#FFFFFF", label: "أبيض", border: true },
    { value: "#C0C0C0", label: "فضي" },
    { value: "#808080", label: "رمادي" },
    { value: "#800000", label: "كحلي أحمر" },
    { value: "#1E3A5F", label: "أزرق" },
    { value: "#2E7D32", label: "أخضر" },
    { value: "#F57F17", label: "بيج / ذهبي" },
    { value: "#8B4513", label: "بني" },
    { value: "#FF6B35", label: "برتقالي" },
];

const steps = ["المعلومات", "الإعدادات"];

const StepIndicator = ({ current }) => (
    <div className="flex items-center justify-center gap-1.5 mb-6">
        {steps.map((label, i) => {
            const done   = i < current;
            const active = i === current;
            return (
                <div key={i} className="flex items-center gap-1.5">
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            done   ? "bg-[#800000] text-white" :
                            active ? "bg-[#800000] text-white ring-4 ring-[#800000]/20" :
                                     "bg-gray-200 text-gray-400"
                        }`}>
                            {done ? <CheckIcon /> : i + 1}
                        </div>
                        <span className={`text-xs ${active ? "text-[#800000] font-semibold" : "text-gray-400"}`}>{label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-10 h-0.5 mb-4 rounded-full ${i < current ? "bg-[#800000]" : "bg-gray-200"}`} />
                    )}
                </div>
            );
        })}
    </div>
);

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

const StepInfo = ({ brand, model, setBrand, setModel, yearRef, plateRef }) => {
    const brandObj = brandsData.find(b => b.en === brand);
    const models   = brandObj?.models ?? [];
    return (
        <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg mb-2">معلومات المركبة</h2>
            <div>
                <label className={labelClass}>الشركة المصنّعة <span className="text-[#800000]">*</span></label>
                <select value={brand} onChange={e => { setBrand(e.target.value); setModel(""); }} className={inputClass}>
                    <option value="">اختر الشركة</option>
                    {brandsData.map(b => <option key={b.en} value={b.en}>{b.ar}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>الموديل <span className="text-[#800000]">*</span></label>
                <select value={model} onChange={e => setModel(e.target.value)} disabled={!brand} className={`${inputClass} disabled:opacity-50`}>
                    <option value="">{brand ? "اختر الموديل" : "اختر الشركة أولاً"}</option>
                    {models.map(m => <option key={m.en} value={m.en}>{m.ar}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>سنة الصنع <span className="text-[#800000]">*</span></label>
                <input ref={yearRef} type="number" defaultValue="" placeholder="مثال: 2021" min="1990" max={new Date().getFullYear()} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>رقم اللوحة <span className="text-[#800000]">*</span></label>
                <input ref={plateRef} type="text" defaultValue="" placeholder="مثال: أ ب ج 1234" className={inputClass} />
            </div>
        </div>
    );
};

const StepSettings = ({ color, setColor, kmRef, regExpiryRef, insExpiryRef, notesRef }) => (
    <div className="space-y-4">
        <h2 className="font-bold text-gray-900 text-lg mb-2">إعدادات المركبة</h2>
        <div>
            <label className={labelClass}>العداد الحالي (كم) <span className="text-[#800000]">*</span></label>
            <div className="relative">
                <input ref={kmRef} type="number" defaultValue="" placeholder="مثال: 85000" className={inputClass} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">كم</span>
            </div>
        </div>
        <div>
            <label className={labelClass}>تاريخ انتهاء التسجيل</label>
            <input ref={regExpiryRef} type="date" defaultValue="" className={inputClass} />
        </div>
        <div>
            <label className={labelClass}>تاريخ انتهاء التأمين</label>
            <input ref={insExpiryRef} type="date" defaultValue="" className={inputClass} />
        </div>
        <div>
            <label className={labelClass}>اللون</label>
            <div className="flex flex-wrap gap-2.5">
                {colors.map(c => (
                    <button key={c.value} type="button" onClick={() => setColor(c.value)} title={c.label}
                        className={`w-9 h-9 rounded-full transition-all duration-150 ${color === c.value ? "ring-2 ring-offset-2 ring-[#800000] scale-110" : ""} ${c.border ? "border-2 border-gray-200" : ""}`}
                        style={{ backgroundColor: c.value }} />
                ))}
            </div>
            {color && <p className="text-xs text-gray-400 mt-1.5">{colors.find(c => c.value === color)?.label}</p>}
        </div>
        <div>
            <label className={labelClass}>ملاحظات (اختياري)</label>
            <textarea ref={notesRef} defaultValue="" placeholder="أي ملاحظات عن المركبة..." rows={3} className={`${inputClass} resize-none`} />
        </div>
    </div>
);

export default function AddVehicle({ vehicleCount = 0, carsLimit = 1 }) {
    const [step, setStep]         = useState(0);
    const [brand, setBrand]       = useState("");
    const [model, setModel]       = useState("");
    const [color, setColor]       = useState("#1A1A1A");
    const [submitting, setSubmitting] = useState(false);

    const yearRef       = useRef(null);
    const plateRef      = useRef(null);
    const kmRef         = useRef(null);
    const regExpiryRef  = useRef(null);
    const insExpiryRef  = useRef(null);
    const notesRef      = useRef(null);
    // Persist step-1 values across step change (refs never go stale)
    const savedYearRef  = useRef("");
    const savedPlateRef = useRef("");

    const canNext = () => {
        if (step === 0) return !!(brand && model);
        return true;
    };

    const goNext = () => {
        savedYearRef.current  = yearRef.current?.value        || "";
        savedPlateRef.current = plateRef.current?.value?.trim() || "";
        setStep(s => s + 1);
    };

    const atLimit = carsLimit > 0 && vehicleCount >= carsLimit;

    const handleSubmit = () => {
        const year               = savedYearRef.current;
        const plateNumber        = savedPlateRef.current;
        const currentKm          = kmRef.current?.value           || "";
        const registrationExpiry = regExpiryRef.current?.value    || null;
        const insuranceExpiry    = insExpiryRef.current?.value    || null;
        const notes              = notesRef.current?.value?.trim() || "";

        console.log("AddVehicle submit →", { submitting, atLimit, year, plateNumber, currentKm, brand, model });

        if (submitting || atLimit) { console.log("blocked: submitting or atLimit"); return; }
        if (!year || !plateNumber || !currentKm) { console.log("blocked: missing fields"); return; }

        const brandObj = brandsData.find(b => b.en === brand);
        const modelObj = brandObj?.models.find(m => m.en === model);
        setSubmitting(true);
        router.post("/vehicles", {
            name_ar:             `${brandObj?.ar ?? brand} ${modelObj?.ar ?? model}`,
            name_en:             `${brand} ${model}`,
            brand,
            type:                "sedan",
            plate_number:        plateNumber,
            km:                  Number(currentKm),
            color,
            year:                Number(year),
            registration_expiry: registrationExpiry || null,
            insurance_expiry:    insuranceExpiry    || null,
            notes:               notes || null,
        }, { onFinish: () => setSubmitting(false) });
    };

    return (
        <>
            <Head title="إضافة مركبة - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button onClick={() => step === 0 ? router.get("/") : setStep(s => s - 1)}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity">
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">إضافة مركبة</h1>
                        <div className="mr-auto ml-4 text-xs text-gray-400">
                            {vehicleCount} / {carsLimit === 0 ? "∞" : carsLimit}
                        </div>
                    </div>

                    {atLimit ? (
                        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#800000]/10 flex items-center justify-center text-3xl">🚗</div>
                            <p className="font-bold text-gray-900 text-lg">وصلت للحد الأقصى</p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                باقتك الحالية تتيح {carsLimit} {carsLimit === 1 ? "مركبة" : "مركبات"} فقط.
                                يمكنك ترقية الباقة لإضافة مركبات أكثر.
                            </p>
                            <button onClick={() => router.get("/subscriptions")}
                                className="mt-2 bg-[#800000] text-white px-6 py-3 rounded-xl font-semibold text-sm active:opacity-90">
                                ترقية الباقة
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="px-4 pt-5 pb-32">
                                    <StepIndicator current={step} />
                                    {step === 0 && (
                                        <StepInfo
                                            brand={brand} model={model}
                                            setBrand={setBrand} setModel={setModel}
                                            yearRef={yearRef} plateRef={plateRef}
                                        />
                                    )}
                                    {step === 1 && (
                                        <StepSettings
                                            color={color} setColor={setColor}
                                            kmRef={kmRef} regExpiryRef={regExpiryRef}
                                            insExpiryRef={insExpiryRef} notesRef={notesRef}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="fixed bottom-0 right-0 left-0 flex justify-center pointer-events-none">
                                <div className="w-full max-w-sm px-4 pb-8 pointer-events-auto safe-bottom">
                                    <button
                                        onClick={() => step < 1 ? goNext() : handleSubmit()}
                                        disabled={!canNext() || submitting}
                                        className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-150 shadow-lg ${
                                            canNext() && !submitting ? "bg-[#800000] text-white active:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {step < 1 ? "التالي" : submitting ? "جاري الإضافة..." : "إضافة المركبة"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
