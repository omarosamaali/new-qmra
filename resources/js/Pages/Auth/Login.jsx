import { useForm } from "@inertiajs/react";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

const LANG_KEY = "app_lang";

const T = {
    ar: {
        title:        "تسجيل الدخول - قمرة",
        subtitle:     "سجّل دخولك للمتابعة",
        email:        "البريد الإلكتروني",
        password:     "كلمة المرور",
        submit:       "تسجيل الدخول",
        loading:      "جارٍ الدخول...",
        noAccount:    "ليس لديك حساب؟",
        register:     "إنشاء حساب",
        forgot:       "نسيت كلمة المرور؟",
        menu:         "القائمة",
        contact:      "تواصل معنا",
        privacy:      "سياسة الخصوصية",
        about:        "اعرفنا",
        language:     "اللغة",
        close:        "إغلاق",
        reqEmail:     "البريد الإلكتروني مطلوب",
        reqPassword:  "كلمة المرور مطلوبة",
    },
    en: {
        title:        "Login - Qumra",
        subtitle:     "Sign in to continue",
        email:        "Email Address",
        password:     "Password",
        submit:       "Sign In",
        loading:      "Signing in...",
        noAccount:    "Don't have an account?",
        register:     "Create Account",
        forgot:       "Forgot password?",
        menu:         "Menu",
        contact:      "Contact Us",
        privacy:      "Privacy Policy",
        about:        "About Us",
        language:     "Language",
        close:        "Close",
        reqEmail:     "Email is required",
        reqPassword:  "Password is required",
    },
};

export default function Login() {
    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem(LANG_KEY) || "ar"; } catch { return "ar"; }
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [localErrors, setLocalErrors] = useState({});

    const t    = T[lang];
    const isAr = lang === "ar";

    const setLang = (v) => {
        setLangState(v);
        try { localStorage.setItem(LANG_KEY, v); } catch {}
    };

    const { data, setData, post, processing, errors } = useForm({
        email:    "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!data.email.trim())    errs.email    = t.reqEmail;
        if (!data.password.trim()) errs.password = t.reqPassword;
        if (Object.keys(errs).length) { setLocalErrors(errs); return; }
        setLocalErrors({});
        post("/login");
    };

    const allErrors = { ...localErrors, ...errors };

    return (
        <>
            <Head title={t.title} />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
                <div className="w-full max-w-sm">

                    {/* Top row: language + menu */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                            </svg>
                            {t.menu}
                        </button>
                        <button
                            type="button"
                            onClick={() => setLang(isAr ? "en" : "ar")}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-colors"
                        >
                            {isAr ? "English" : "عربي"}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-10">
                        <img src="/images/dark-logo.png" alt="قمرة" className="h-20 object-contain mb-3" />
                        <p className="text-gray-500 text-sm">{t.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.email}</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => { setData("email", e.target.value); setLocalErrors(p => ({ ...p, email: "" })); }}
                                placeholder="example@email.com"
                                autoComplete="email"
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400 ${allErrors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {allErrors.email && <p className="text-red-500 text-xs mt-1 text-center">{allErrors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.password}</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => { setData("password", e.target.value); setLocalErrors(p => ({ ...p, password: "" })); }}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400 ${allErrors.password ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {allErrors.password && <p className="text-red-500 text-xs mt-1 text-center">{allErrors.password}</p>}
                        </div>

                        {/* Forgot password */}
                        <div className="text-center">
                            <a href="/forgot-password" className="text-xs text-[#800000] font-medium hover:underline">
                                {t.forgot}
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm mt-2 active:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {processing ? t.loading : t.submit}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        {t.noAccount}{" "}
                        <a href="/register" className="text-[#800000] font-semibold">{t.register}</a>
                    </p>
                </div>
            </div>

            {/* Drawer overlay */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDrawerOpen(false)}>
                    <div className="bg-white rounded-t-3xl p-6 w-full max-w-sm mx-auto" dir={isAr ? "rtl" : "ltr"} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                            <p className="font-bold text-gray-800 text-base">{t.menu}</p>
                        </div>

                        {/* Language row */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div className="flex gap-2">
                                {["ar", "en"].map(l => (
                                    <button key={l} onClick={() => setLang(l)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${lang === l ? "bg-[#800000] text-white border-[#800000]" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                                        {l === "ar" ? "عربي" : "English"}
                                    </button>
                                ))}
                            </div>
                            <span className="text-gray-700 text-sm font-medium">{t.language}</span>
                        </div>

                        {/* Nav links */}
                        {[
                            { label: t.contact, href: "/contact", icon: "💬" },
                            { label: t.privacy, href: "/terms",   icon: "🔒" },
                            { label: t.about,   href: "/about",   icon: "ℹ️" },
                        ].map(item => (
                            <a key={item.href} href={item.href}
                                className="flex items-center justify-between py-3.5 border-b border-gray-100 text-gray-700 hover:text-[#800000] transition-colors">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </a>
                        ))}
                        <div className="h-4" />
                    </div>
                </div>
            )}
        </>
    );
}
