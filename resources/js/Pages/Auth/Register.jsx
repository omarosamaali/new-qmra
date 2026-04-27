import { Head } from "@inertiajs/react";
import { useState, useRef } from "react";
import axios from "axios";

const LANG_KEY = "app_lang";

const T = {
    ar: {
        title:           "إنشاء حساب - قمرة",
        subtitle:        "أنشئ حسابك الآن",
        name:            "الاسم الكامل",
        email:           "البريد الإلكتروني",
        phone:           "رقم الجوال (اختياري)",
        password:        "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        submit:          "إنشاء الحساب",
        loading:         "جارٍ الإنشاء...",
        hasAccount:      "لديك حساب بالفعل؟",
        login:           "تسجيل الدخول",
        passwordHint:    "8 أحرف على الأقل",
        menu:            "القائمة",
        contact:         "تواصل معنا",
        privacy:         "سياسة الخصوصية",
        about:           "اعرفنا",
        language:        "اللغة",
        reqName:         "الاسم مطلوب",
        reqEmail:        "البريد الإلكتروني مطلوب",
        reqPassword:     "كلمة المرور مطلوبة (8 أحرف على الأقل)",
        reqConfirm:      "تأكيد كلمة المرور مطلوب",
        mismatch:        "كلمتا المرور غير متطابقتين",
    },
    en: {
        title:           "Create Account - Qumra",
        subtitle:        "Create your account now",
        name:            "Full Name",
        email:           "Email Address",
        phone:           "Phone Number (optional)",
        password:        "Password",
        confirmPassword: "Confirm Password",
        submit:          "Create Account",
        loading:         "Creating account...",
        hasAccount:      "Already have an account?",
        login:           "Sign In",
        passwordHint:    "At least 8 characters",
        menu:            "Menu",
        contact:         "Contact Us",
        privacy:         "Privacy Policy",
        about:           "About Us",
        language:        "Language",
        reqName:         "Name is required",
        reqEmail:        "Email is required",
        reqPassword:     "Password required (min 8 characters)",
        reqConfirm:      "Confirm password is required",
        mismatch:        "Passwords don't match",
    },
};

export default function Register() {
    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem(LANG_KEY) || "ar"; } catch { return "ar"; }
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [errors, setErrors]         = useState({});
    const [processing, setProcessing] = useState(false);

    const nameRef     = useRef(null);
    const emailRef    = useRef(null);
    const phoneRef    = useRef(null);
    const passwordRef = useRef(null);
    const confirmRef  = useRef(null);

    const t    = T[lang];
    const isAr = lang === "ar";

    const setLang = (v) => {
        setLangState(v);
        try { localStorage.setItem(LANG_KEY, v); } catch {}
    };

    const clearErr = (key) => setErrors(p => ({ ...p, [key]: "" }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name                  = nameRef.current?.value?.trim()    || "";
        const email                 = emailRef.current?.value?.trim()   || "";
        const phone                 = phoneRef.current?.value?.trim()   || "";
        const password              = passwordRef.current?.value        || "";
        const password_confirmation = confirmRef.current?.value         || "";

        const errs = {};
        if (!name)                              errs.name                  = t.reqName;
        if (!email)                             errs.email                 = t.reqEmail;
        if (password.length < 8)               errs.password              = t.reqPassword;
        if (!password_confirmation.trim())      errs.password_confirmation = t.reqConfirm;
        if (password && password_confirmation && password !== password_confirmation)
            errs.password_confirmation = t.mismatch;
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setErrors({});
        setProcessing(true);
        try {
            await axios.get("/sanctum/csrf-cookie");
            const res = await axios.post("/register", { name, email, phone, password, password_confirmation }, {
                headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" },
            });
            window.location.href = res.data?.redirect || "/";
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) setErrors(data.errors);
            else setErrors({ name: data?.message || "حدث خطأ، حاول مرة أخرى" });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title={t.title} />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10" dir={isAr ? "rtl" : "ltr"}>
                <div className="w-full max-w-sm">

                    {/* Top row: menu + language */}
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
                    <div className="flex flex-col items-center mb-8">
                        <img src="/images/dark-logo.png" alt="قمرة" className="h-20 object-contain mb-3" />
                        <p className="text-gray-500 text-sm">{t.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.name}</label>
                            <input
                                ref={nameRef}
                                type="text"
                                defaultValue=""
                                placeholder={isAr ? "محمد العلي" : "John Smith"}
                                autoComplete="name"
                                onChange={() => clearErr("name")}
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 text-center">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.email}</label>
                            <input
                                ref={emailRef}
                                type="email"
                                defaultValue=""
                                placeholder="example@email.com"
                                autoComplete="email"
                                onChange={() => clearErr("email")}
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400 ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 text-center">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.phone}</label>
                            <input
                                ref={phoneRef}
                                type="tel"
                                defaultValue=""
                                placeholder="+971 50 000 0000"
                                autoComplete="tel"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.password}</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                defaultValue=""
                                placeholder="••••••••"
                                autoComplete="new-password"
                                onChange={() => clearErr("password")}
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {!errors.password && <p className="text-gray-400 text-xs mt-1 text-center">{t.passwordHint}</p>}
                            {errors.password && <p className="text-red-500 text-xs mt-1 text-center">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.confirmPassword}</label>
                            <input
                                ref={confirmRef}
                                type="password"
                                defaultValue=""
                                placeholder="••••••••"
                                autoComplete="new-password"
                                onChange={() => clearErr("password_confirmation")}
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400 ${errors.password_confirmation ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1 text-center">{errors.password_confirmation}</p>}
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
                        {t.hasAccount}{" "}
                        <a href="/login" className="text-[#800000] font-semibold">{t.login}</a>
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
