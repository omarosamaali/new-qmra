import { useState, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

// ─── Assistant Avatar ─────────────────────────────────────────────────────────

const AssistantAvatar = ({ gender, name, selected, onClick }) => {
    const isMale = gender === "male";
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-3xl transition-all duration-200 ${
                selected
                    ? "bg-[#800000]/10 ring-2 ring-[#800000] shadow-md"
                    : "bg-white shadow-sm active:opacity-80"
            }`}
        >
            <div className="w-24 h-24 overflow-hidden shadow-inner">
                <img
                    src={isMale ? "/images/man.png" : "/images/girl.png"}
                    alt={name}
                    className="rounded-2xl w-full h-full object-cover"
                />
            </div>
            <div className="text-center">
                <p className={`font-bold text-lg ${selected ? "text-[#800000]" : "text-gray-900"}`}>{name}</p>
            </div>
            {selected && (
                <div className="w-7 h-7 rounded-full bg-[#800000] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                </div>
            )}
        </button>
    );
};

// ─── Step 1: Language ─────────────────────────────────────────────────────────

const StepLanguage = ({ value, onChange }) => (
    <div className="flex flex-col items-center h-full justify-center gap-8 px-6 py-10">
        <img src="/images/dark-logo.png" alt="قمرة" className="h-16 object-contain" />
        <div className="text-center">
            <h1 className="text-2xl font-black text-gray-900 mb-2">مرحباً بك</h1>
            <p className="text-gray-400 text-sm">اختر لغة التطبيق / Choose your language</p>
        </div>
        <div className="w-full space-y-3">
            {[
                { val: "ar", flag: "https://flagcdn.com/w40/ae.png", label: "العربية", sub: "Arabic" },
                { val: "en", flag: "https://flagcdn.com/w40/gb.png", label: "English", sub: "الإنجليزية" },
            ].map(({ val, flag, label, sub }) => (
                <button key={val} onClick={() => onChange(val)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                        value === val ? "bg-[#800000] text-white shadow-lg scale-[1.02]" : "bg-white shadow-sm text-gray-800 active:opacity-80"
                    }`}>
                    <img src={flag} alt={val} className="w-9 h-6 object-cover rounded-sm shadow-sm shrink-0" />
                    <div className={`flex-1 ${val === "ar" ? "text-right" : "text-left"}`}>
                        <p className="font-bold text-lg">{label}</p>
                    </div>
                    {value === val && (
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        </div>
                    )}
                </button>
            ))}
        </div>
    </div>
);

// ─── Step 2: Layout ───────────────────────────────────────────────────────────

const StepLayout = ({ value, onChange, lang }) => {
    const isEn = lang === "en";
    return (
    <div className="flex flex-col h-full justify-center gap-8 px-6 py-10" dir={isEn ? "ltr" : "rtl"}>
        <div className="text-center">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
                {isEn ? "Choose Layout" : "اختر التصميم"}
            </h1>
            <p className="text-gray-400 text-sm">
                {isEn ? "Choose how the app is displayed" : "اختر طريقة عرض التطبيق المناسبة لك"}
            </p>
        </div>
        <div className="flex gap-4">
            {[
                { val: "portrait",  ar: "طولي",  en: "Portrait",  w: "w-16 h-24" },
                { val: "landscape", ar: "عرضي",  en: "Landscape", w: "w-24 h-16" },
            ].map(({ val, ar, en, w }) => (
                <button key={val} onClick={() => onChange(val)}
                    className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-3xl transition-all duration-200 ${
                        value === val ? "bg-[#800000]/10 ring-2 ring-[#800000] shadow-md" : "bg-white shadow-sm active:opacity-80"
                    }`}>
                    <div className={`${w} rounded-xl border-2 flex flex-col overflow-hidden ${value === val ? "border-[#800000]" : "border-gray-300"}`}>
                        <div className={`h-4 ${value === val ? "bg-[#800000]" : "bg-gray-200"}`} />
                        <div className="flex-1 p-1.5 space-y-1">
                            <div className="h-1.5 bg-gray-200 rounded-full" />
                            <div className="h-1.5 bg-gray-200 rounded-full w-3/4" />
                        </div>
                    </div>
                    <p className={`font-bold text-sm ${value === val ? "text-[#800000]" : "text-gray-700"}`}>
                        {isEn ? en : ar}
                    </p>
                </button>
            ))}
        </div>
    </div>
    );
};

// ─── Step 3: Assistant ────────────────────────────────────────────────────────

const StepAssistant = ({ value, onChange, lang }) => {
    const isEn = lang === "en";
    return (
    <div className="flex flex-col h-full justify-center gap-6 px-6 py-10" dir={isEn ? "ltr" : "rtl"}>
        <div className="text-center">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
                {isEn ? "Choose Your AI Assistant" : "اختر مساعدك الذكي"}
            </h1>
            <p className="text-gray-400 text-sm">
                {isEn ? "Your companion on every journey" : "سيكون معك في كل رحلة"}
            </p>
        </div>
        <div className="flex gap-3">
            <AssistantAvatar gender="male"   name={isEn ? "Hamad"   : "حمد"}  selected={value === "sakr"}  onClick={() => onChange("sakr")} />
            <AssistantAvatar gender="female" name={isEn ? "Sheikha" : "شيخة"} selected={value === "hamda"} onClick={() => onChange("hamda")} />
        </div>
        {value && (
            <div className="bg-[#800000]/8 rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-[#800000] mb-1">
                    {value === "sakr"
                        ? (isEn ? "Hi! I'm Hamad" : "مرحباً! أنا حمد")
                        : (isEn ? "Hi! I'm Sheikha" : "مرحباً! أنا شيخة")}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                    {value === "sakr"
                        ? (isEn ? "I'll be with you on every trip, reminding you of maintenance schedules and helping you manage your vehicles smartly."
                                : "سأكون معك في كل رحلة، أذكّرك بمواعيد الصيانة وأساعدك في إدارة مركباتك بذكاء.")
                        : (isEn ? "I'll be your constant companion on the road, keeping you safe and tracking your vehicle maintenance."
                                : "سأكون رفيقتك الدائمة في الطريق، أحرص على سلامتك وأتابع صيانة مركباتك باستمرار.")}
                </p>
            </div>
        )}
    </div>
    );
};

// ─── Step 4: Phone Link ───────────────────────────────────────────────────────

const StepPhoneLink = ({ onSkip, lang }) => {
    const isEn = lang === "en";
    const [code, setCode]             = useState("");
    const [timeLeft, setTimeLeft]     = useState(0);
    const [loading, setLoading]       = useState(false);
    const [linked, setLinked]         = useState(false);
    const [androidLink, setAndroidLink] = useState("https://play.google.com/store/apps/details?id=com.qumra.app");
    const [iosLink, setIosLink]         = useState("https://apps.apple.com/app/id6746456087");

    useEffect(() => {
        axios.get("https://qmra.ae/api/site-settings")
            .then(res => {
                const d = res.data?.data ?? res.data ?? {};
                if (d.android_app_link) setAndroidLink(d.android_app_link);
                if (d.ios_app_link)     setIosLink(d.ios_app_link);
            })
            .catch(() => {});
    }, []);

    const generateCode = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.post("/api/car/generate-code");
            setCode(res.data.code);
            setTimeLeft(res.data.expires_in); // 600 seconds
        } catch {
            setCode("خطأ في التوليد");
        } finally {
            setLoading(false);
        }
    }, []);

    // Generate on mount
    useEffect(() => { generateCode(); }, [generateCode]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const id = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(id); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [timeLeft]);

    const mins    = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const secs    = String(timeLeft % 60).padStart(2, "0");
    const expired = timeLeft === 0 && !!code;

    // Poll for link confirmation every 3s
    // Uses /api/car/vehicle/{code} — only returns data when is_linked=true,
    // so it correctly distinguishes "linked" from "code expired".
    useEffect(() => {
        if (!code || linked || expired) return;
        const id = setInterval(async () => {
            try {
                const res = await axios.get(`/api/car/vehicle/${code}`);
                if (res.data?.id) {
                    localStorage.setItem("car_link_code", code);
                    setLinked(true);
                    clearInterval(id);
                }
            } catch {
                // 404 = not linked yet — keep waiting
            }
        }, 3000);
        return () => clearInterval(id);
    }, [code, linked, expired]);

    useEffect(() => {
        if (linked) {
            const id = setTimeout(() => { window.location.href = "/car/dashboard"; }, 1500);
            return () => clearTimeout(id);
        }
    }, [linked]);

    if (linked) {
        return (
            <div className="flex flex-col h-full justify-center gap-5 px-6 py-8 text-center" dir={isEn ? "ltr" : "rtl"}>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto text-4xl">✅</div>
                <h2 className="text-2xl font-black text-gray-900">{isEn ? "Linked successfully!" : "تم الربط بنجاح!"}</h2>
                <p className="text-sm text-gray-400">{isEn ? "Redirecting to dashboard..." : "جاري الانتقال للوحة التحكم..."}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center gap-5 px-6 py-8" dir={isEn ? "ltr" : "rtl"}>
            <div className="text-center">
                <h1 className="text-2xl font-black text-gray-900 mb-2">{isEn ? "Link Phone" : "ربط الهاتف"}</h1>
                <p className="text-gray-400 text-sm">{isEn ? "Link the phone app with your account" : "اربط تطبيق الهاتف مع حسابك"}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm text-center space-y-4">
                <div className="flex justify-center">
                    {loading || !code ? (
                        <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 animate-spin text-[#800000]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                        </div>
                    ) : (
                        <div className={`p-3 rounded-2xl ${expired ? "opacity-30" : ""}`}>
                            <QRCodeSVG value={code} size={180} fgColor="#800000" bgColor="#ffffff" level="M"
                                imageSettings={{ src: "/images/fav.png", width: 36, height: 36, excavate: true }} />
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-400">
                    {isEn ? "Open Qumra app on your phone and scan the QR code" : "افتح تطبيق قمرة على هاتفك واسحب الكاميرا لمسح الرمز"}
                </p>

                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100"/>
                    <span className="text-xs text-gray-300">{isEn ? "or" : "أو"}</span>
                    <div className="flex-1 h-px bg-gray-100"/>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-2">
                        {isEn ? "Enter this code in the phone app" : "أدخل هذا الرمز في تطبيق الهاتف"}
                    </p>
                    <div className={`rounded-2xl py-4 px-4 ${expired ? "bg-gray-100" : "bg-[#800000]/8"}`}>
                        <p className={`font-black text-2xl tracking-widest ${expired ? "text-gray-300" : "text-[#800000]"}`}>
                            {loading ? "..." : code}
                        </p>
                    </div>
                    {!expired && timeLeft > 0 && (
                        <p className="text-xs text-gray-300 mt-2">
                            {isEn ? `Valid for ${mins}:${secs}` : `الرمز صالح لمدة ${mins}:${secs}`}
                        </p>
                    )}
                    {expired && (
                        <p className="text-xs text-red-400 mt-2 font-medium">
                            {isEn ? "Code expired" : "انتهت صلاحية الرمز"}
                        </p>
                    )}
                    <button onClick={generateCode} disabled={loading}
                        className="text-xs text-[#800000] font-semibold mt-2 active:opacity-70 disabled:opacity-40">
                        🔄 {isEn ? "Refresh Code" : "تجديد الرمز"}
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3">
                <p className="text-xs text-amber-700 text-center mb-3 font-medium">
                    {isEn ? "Download Qumra on your phone" : "حمّل تطبيق قمرة على هاتفك"}
                </p>
                <div className="flex gap-3">
                    <div className="flex-1 flex flex-col items-center gap-2">
                        <QRCodeSVG value={androidLink} size={72} />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                            alt="Google Play" className="h-7 object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                        <QRCodeSVG value={iosLink} size={72} />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                            alt="App Store" className="h-7 object-contain" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Progress dots ────────────────────────────────────────────────────────────

const ProgressDots = ({ total, current }) => (
    <div className="flex justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2 bg-[#800000]" : i < current ? "w-2 h-2 bg-[#800000]/40" : "w-2 h-2 bg-gray-200"
            }`} />
        ))}
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const TOTAL = 4;

const playSound = (file) => {
    try {
        const audio = new Audio(`/sounds/${encodeURIComponent(file)}`);
        audio.play().catch(() => {});
    } catch {}
};

export default function Onboarding() {
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [prefs, setPrefs] = useState({ language: "", layout: "", assistant: "" });

    // ── Skip onboarding if already configured ────────────────────────────────
    useEffect(() => {
        const lang      = localStorage.getItem("car_lang");
        const assistant = localStorage.getItem("car_assistant");
        if (lang && assistant) {
            router.get("/car/dashboard");
        }
    }, []);

    const handleStart = () => {
        setStarted(true);
        playSound("اختيار اللغة.ogg");
    };

    useEffect(() => {
        if (!started) return;
        const isEn = prefs.language === "en";
        if (step === 1) playSound(isEn ? "en-اختيار حجم الشاشة.mpeg"     : "اختيار حجم الشاشة.mpeg");
        if (step === 2) playSound(isEn ? "en-اختيار المساعد الذكي .ogg"   : "اختيار المساعد الذكي .ogg");
        if (step === 3) playSound(isEn ? "en-ربط ال QR Code.ogg"          : "ربط ال QR Code.ogg");
    }, [step, started, prefs.language]);

    const update = (key, val) => setPrefs(p => ({ ...p, [key]: val }));
    const canNext  = () => {
        if (step === 0) return prefs.language;
        if (step === 1) return prefs.layout;
        if (step === 2) return prefs.assistant;
        return true;
    };
    const handleNext = () => {
        // Save each pref as the user advances
        if (step === 0 && prefs.language)  localStorage.setItem("car_lang",      JSON.stringify(prefs.language));
        if (step === 1 && prefs.layout)    localStorage.setItem("car_layout",     prefs.layout);
        if (step === 2 && prefs.assistant) localStorage.setItem("car_assistant",  JSON.stringify(prefs.assistant));

        if (step < TOTAL - 1) {
            setStep(s => s + 1);
        } else {
            router.get("/car/dashboard");
        }
    };

    if (!started) return (
        <>
            <Head title="قمرة - الإعداد" />
            <div className="min-h-dvh bg-gray-100 flex justify-center items-center safe-screen" dir="rtl">
                <div className="flex flex-col items-center gap-8 px-6">
                    <img src="/images/dark-logo.png" alt="قمرة" className="h-20 object-contain" />
                    <button onClick={handleStart}
                        className="px-10 py-4 bg-[#800000] text-white font-bold text-lg rounded-2xl shadow-lg active:opacity-80 transition-opacity">
                        ابدأ
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Head title="قمرة - الإعداد" />
            <div className="min-h-dvh bg-gray-100 flex justify-center" dir={prefs.language === "en" ? "ltr" : "rtl"} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {step === 0 && <StepLanguage   value={prefs.language}  onChange={v => update("language",  v)} />}
                        {step === 1 && <StepLayout     value={prefs.layout}    onChange={v => update("layout",    v)} lang={prefs.language} />}
                        {step === 2 && <StepAssistant  value={prefs.assistant} onChange={v => update("assistant", v)} lang={prefs.language} />}
                        {step === 3 && <StepPhoneLink  lang={prefs.language} />}
                    </div>
                    {step < TOTAL - 1 && (
                        <div className="px-6 pb-10 space-y-4 bg-gray-100">
                            <ProgressDots total={TOTAL} current={step} />
                            <button onClick={handleNext} disabled={!canNext()}
                                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg ${
                                    canNext() ? "bg-[#800000] text-white active:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}>
                                {prefs.language === "en" ? "Next" : "التالي"}
                            </button>
                            {step > 0 && (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="w-full text-sm text-gray-400 py-1 active:opacity-70">
                                    {prefs.language === "en" ? "← Back" : "→ رجوع"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
