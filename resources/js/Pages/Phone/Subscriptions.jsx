import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
);

const SpinIcon = () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
);

const PlanCard = ({ pkg, isCurrentPlan, billing, onSubscribe, loading }) => {
    const price = billing === "yearly" ? pkg.yearly_price : pkg.monthly_price;
    const period = billing === "yearly" ? "سنة" : "شهر";
    const isFree = parseFloat(price) === 0;

    return (
        <div className={`rounded-3xl overflow-hidden shadow-sm transition-all duration-200 ${isCurrentPlan ? "ring-2 ring-[#800000] shadow-md" : ""}`}>
            <div className="bg-[#800000] px-4 pt-4 pb-5 relative">
                {isCurrentPlan && (
                    <span className="absolute top-3 left-3 text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                        خطتك الحالية
                    </span>
                )}
                {pkg.icon && (
                    <img src={pkg.icon} alt="" className="w-8 h-8 object-contain mb-2 opacity-80"
                        onError={e => e.target.style.display = 'none'} />
                )}
                <h3 className="font-bold text-lg text-white">{pkg.title}</h3>
                <div className="flex items-end gap-1 mt-1 text-white">
                    {isFree ? (
                        <span className="text-2xl font-black">مجاناً</span>
                    ) : (
                        <>
                            <span className="text-2xl font-black">{parseFloat(price).toFixed(0)}</span>
                            <span className="text-sm opacity-80 mb-0.5">AED / {period}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-3 mt-2 text-white/70 text-xs">
                    <span>🚗 {pkg.cars_count} مركبة</span>
                    <span>🔗 {pkg.addons_count} ربط</span>
                </div>
            </div>

            <div className="bg-white px-4 py-4 space-y-2.5">
                {(pkg.features ?? []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#800000]/10 flex items-center justify-center shrink-0">
                            <CheckIcon className="w-3 h-3 text-[#800000]" />
                        </div>
                        <span className="text-xs text-gray-700">{f}</span>
                    </div>
                ))}

                <button
                    onClick={() => !isCurrentPlan && onSubscribe(pkg.id)}
                    disabled={isCurrentPlan || loading}
                    className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
                        isCurrentPlan
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-[#800000] text-white active:opacity-90 disabled:opacity-60"
                    }`}
                >
                    {loading ? <SpinIcon /> : null}
                    {isCurrentPlan ? "خطتك الحالية" : isFree ? "البدء مجاناً" : "اشترك الآن"}
                </button>
            </div>
        </div>
    );
};

export default function Subscriptions({ packages = [], subscription = null, sessionId = null, paymentStatus = null }) {
    const [billing, setBilling]   = useState("monthly");
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError]       = useState("");
    const [error_data, setErrorData] = useState(null);
    const currentPackageId = subscription?.package_id ?? null;

    const handleSubscribe = async (packageId) => {
        setLoadingId(packageId);
        setError("");
        try {
            const pkg = packages.find(p => p.id === packageId);
            const res = await axios.post(`/subscriptions/${packageId}/${billing || 'monthly'}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
            });
            const paymentUrl = res.data?.payment_url;
            if (paymentUrl) {
                window.location.href = paymentUrl;
                return;
            }
            router.get("/");
        } catch (e) {
            const msg = e.response?.data?.message
                ?? e.response?.data?.error
                ?? e.message
                ?? "حدث خطأ، حاول مرة أخرى";
            setError(msg);
            setErrorData(e.response?.data?.error_data ?? null);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <>
            <Head title="الاشتراكات - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        {subscription && (
                            <button onClick={() => router.get("/")}
                                className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity">
                                <BackIcon />
                            </button>
                        )}
                        <h1 className="mx-auto font-bold text-gray-900 text-lg px-4">الاشتراكات</h1>
                        <button
                            onClick={() => router.post("/logout")}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 active:text-red-500 transition-colors ml-3"
                            title="تسجيل الخروج"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                            </svg>
                        </button>
                    </div>

                    {/* {sessionId && (
                        <div className="bg-gray-800 px-4 py-2">
                            <p className="text-xs text-green-400 font-mono break-all">session: {sessionId}</p>
                        </div>
                    )} */}

                    {!subscription && (
                        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
                            <p className="text-sm text-amber-800 font-medium text-center">
                                يرجى الاشتراك في إحدى الباقات للمتابعة
                            </p>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-5 space-y-4 pb-safe-nav">

                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                                    <p className="text-sm text-red-600 text-center">{error}</p>
                                </div>
                            )}

                            {/* print error_data if it exists */}
                            {error_data && (
                                <pre className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 overflow-x-auto">
                                    <code className="text-xs text-gray-600">{JSON.stringify(error_data, null, 2)}</code>
                                </pre>
                            )}
                            {paymentStatus === "success" && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                                    <p className="text-sm text-emerald-700 text-center">
                                        تم استلام نتيجة الدفع بنجاح وجاري تفعيل الاشتراك.
                                    </p>
                                </div>
                            )}
                            {paymentStatus === "cancelled" && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                                    <p className="text-sm text-amber-800 text-center">
                                        تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى في أي وقت.
                                    </p>
                                </div>
                            )}
                            {paymentStatus === "failed" && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                                    <p className="text-sm text-red-600 text-center">
                                        فشلت عملية الدفع. يرجى التحقق من وسيلة الدفع والمحاولة مجددًا.
                                    </p>
                                </div>
                            )}

                            <div className="flex bg-white rounded-2xl p-1 shadow-sm" role="radiogroup" aria-label="فترة الاشتراك">
                                {["monthly", "yearly"].map(b => (
                                    <label key={b}
                                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                                            billing === b ? "bg-[#800000] text-white shadow-sm" : "text-gray-500"
                                        }`}>
                                        <input
                                            type="radio"
                                            name="billing-period"
                                            value={b}
                                            checked={billing === b}
                                            onChange={() => setBilling(b)}
                                            className="sr-only"
                                        />
                                        {b === "monthly" ? "شهري" : "سنوي"}
                                        {b === "yearly" && (
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${billing === "yearly" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                                                وفّر 20%
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>

                            {packages.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 text-center">
                                    <p className="text-gray-400 text-sm">جاري تحميل الباقات...</p>
                                </div>
                            ) : (
                                packages.map(pkg => (
                                    <PlanCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        billing={billing}
                                        isCurrentPlan={pkg.id === currentPackageId}
                                        onSubscribe={handleSubscribe}
                                        loading={loadingId === pkg.id}
                                    />
                                ))
                            )}

                            <div className="bg-white rounded-3xl p-4 shadow-sm">
                                <p className="font-bold text-gray-900 px-1 pb-3">أسئلة شائعة</p>
                                {[
                                    { q: "هل يمكنني إلغاء الاشتراك في أي وقت؟", a: "نعم، يمكنك إلغاء الاشتراك في أي وقت دون أي رسوم إضافية." },
                                    { q: "هل بياناتي آمنة؟", a: "نعم، نستخدم أعلى معايير التشفير لحماية بياناتك." },
                                    { q: "ما هي طرق الدفع المتاحة؟", a: "ندعم جميع البطاقات الائتمانية عبر بوابة Ziina الآمنة." },
                                ].map((item, i) => (
                                    <div key={i} className="py-3 border-b border-gray-50 last:border-0">
                                        <p className="font-semibold text-gray-900 text-sm mb-1">{item.q}</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
