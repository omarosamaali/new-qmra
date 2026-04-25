import { Head } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";

const LANG_KEY = "app_lang";

const T = {
    ar: {
        title:       "استعادة كلمة المرور - قمرة",
        step1Title:  "نسيت كلمة المرور؟",
        step1Sub:    "أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق",
        step2Title:  "إعادة تعيين كلمة المرور",
        step2Sub:    "أدخل الرمز المُرسل إلى بريدك الإلكتروني",
        email:       "البريد الإلكتروني",
        code:        "رمز التحقق",
        password:    "كلمة المرور الجديدة",
        confirm:     "تأكيد كلمة المرور",
        sendCode:    "إرسال الرمز",
        sending:     "جارٍ الإرسال...",
        reset:       "تغيير كلمة المرور",
        resetting:   "جارٍ التغيير...",
        backToLogin: "العودة لتسجيل الدخول",
        resend:      "إعادة إرسال الرمز",
        codeSent:    "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        resetDone:   "تم تغيير كلمة المرور بنجاح",
        loginNow:    "تسجيل الدخول الآن",
        reqEmail:    "البريد الإلكتروني مطلوب",
        reqCode:     "رمز التحقق مطلوب",
        reqPassword: "كلمة المرور مطلوبة (8 أحرف على الأقل)",
        reqConfirm:  "تأكيد كلمة المرور مطلوب",
        mismatch:    "كلمتا المرور غير متطابقتين",
        passwordHint:"8 أحرف على الأقل",
    },
    en: {
        title:       "Reset Password - Qumra",
        step1Title:  "Forgot Password?",
        step1Sub:    "Enter your email and we'll send you a verification code",
        step2Title:  "Reset Your Password",
        step2Sub:    "Enter the code sent to your email",
        email:       "Email Address",
        code:        "Verification Code",
        password:    "New Password",
        confirm:     "Confirm Password",
        sendCode:    "Send Code",
        sending:     "Sending...",
        reset:       "Reset Password",
        resetting:   "Resetting...",
        backToLogin: "Back to Sign In",
        resend:      "Resend Code",
        codeSent:    "Verification code has been sent to your email",
        resetDone:   "Password has been reset successfully",
        loginNow:    "Sign In Now",
        reqEmail:    "Email is required",
        reqCode:     "Verification code is required",
        reqPassword: "Password required (min 8 characters)",
        reqConfirm:  "Confirm password is required",
        mismatch:    "Passwords don't match",
        passwordHint:"At least 8 characters",
    },
};

export default function ForgotPassword() {
    const [lang] = useState(() => {
        try { return localStorage.getItem(LANG_KEY) || "ar"; } catch { return "ar"; }
    });
    const t    = T[lang];
    const isAr = lang === "ar";

    const [step, setStep]         = useState(1); // 1 = enter email, 2 = enter code+new password, 3 = done
    const [email, setEmail]       = useState("");
    const [code, setCode]         = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm]   = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");
    const [success, setSuccess]   = useState("");

    const validate1 = () => {
        if (!email.trim()) { setError(t.reqEmail); return false; }
        setError(""); return true;
    };

    const validate2 = () => {
        if (!code.trim())        { setError(t.reqCode);     return false; }
        if (password.length < 8) { setError(t.reqPassword); return false; }
        if (!confirm.trim())     { setError(t.reqConfirm);  return false; }
        if (password !== confirm){ setError(t.mismatch);    return false; }
        setError(""); return true;
    };

    const sendCode = async () => {
        if (!validate1()) return;
        setLoading(true); setError(""); setSuccess("");
        try {
            const res = await axios.post("/forgot-password/send-code", { email });
            setSuccess(res.data.message || t.codeSent);
            setStep(2);
        } catch (e) {
            setError(e.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!validate2()) return;
        setLoading(true); setError(""); setSuccess("");
        try {
            const res = await axios.post("/forgot-password/reset", {
                email,
                code,
                password,
                password_confirmation: confirm,
            });
            setSuccess(res.data.message || t.resetDone);
            setStep(3);
        } catch (e) {
            setError(e.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={t.title} />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
                <div className="w-full max-w-sm">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-10">
                        <img src="/images/dark-logo.png" alt="قمرة" className="h-20 object-contain mb-3" />
                        <p className="font-bold text-gray-800 text-lg">
                            {step === 1 ? t.step1Title : step === 2 ? t.step2Title : t.resetDone}
                        </p>
                        {step < 3 && (
                            <p className="text-gray-500 text-sm mt-1 text-center">
                                {step === 1 ? t.step1Sub : t.step2Sub}
                            </p>
                        )}
                    </div>

                    {/* Step indicator */}
                    {step < 3 && (
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {[1, 2].map(s => (
                                <div key={s} className={`w-8 h-1.5 rounded-full transition-colors ${step >= s ? "bg-[#800000]" : "bg-gray-200"}`} />
                            ))}
                        </div>
                    )}

                    {/* Error / success banner */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">
                            {error}
                        </div>
                    )}
                    {success && step === 2 && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 text-center">
                            {success}
                        </div>
                    )}

                    {/* ── Step 1: email ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.email}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(""); }}
                                    placeholder="example@email.com"
                                    autoComplete="email"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400"
                                />
                            </div>
                            <button
                                onClick={sendCode}
                                disabled={loading}
                                className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity disabled:opacity-60"
                            >
                                {loading ? t.sending : t.sendCode}
                            </button>
                        </div>
                    )}

                    {/* ── Step 2: code + new password ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.code}</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => { setCode(e.target.value); setError(""); }}
                                    placeholder="123456"
                                    inputMode="numeric"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.password}</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400"
                                />
                                <p className="text-gray-400 text-xs mt-1 text-center">{t.passwordHint}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">{t.confirm}</label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={e => { setConfirm(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-gray-400"
                                />
                            </div>
                            <button
                                onClick={resetPassword}
                                disabled={loading}
                                className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity disabled:opacity-60"
                            >
                                {loading ? t.resetting : t.reset}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                                className="w-full text-center text-sm text-gray-500 hover:text-[#800000] transition-colors py-1"
                            >
                                {t.resend}
                            </button>
                        </div>
                    )}

                    {/* ── Step 3: success ── */}
                    {step === 3 && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-6xl">✅</div>
                            <p className="text-green-600 font-semibold text-base text-center">{success || t.resetDone}</p>
                            <a href="/login"
                                className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm text-center block active:opacity-90 transition-opacity mt-2">
                                {t.loginNow}
                            </a>
                        </div>
                    )}

                    {step < 3 && (
                        <p className="text-center text-sm text-gray-400 mt-6">
                            <a href="/login" className="text-[#800000] font-medium hover:underline">{t.backToLogin}</a>
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
