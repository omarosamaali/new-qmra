import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

export default function Contact() {
    const { flash = {} } = usePage().props;
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // عرض رسالة النجاح لما يرجع الـ flash
    if (flash.contact_sent && !sent) setSent(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        router.post('/contact', form, {
            preserveScroll: true,
            onFinish: () => setSending(false),
        });
    };

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <>
            <Head title="تواصل معنا - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    {/* Header */}
                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">تواصل معنا</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-5 pb-10 space-y-5">

                            {/* Contact form */}
                            <div className="bg-white rounded-3xl p-4 shadow-sm">
                                <p className="font-bold text-gray-900 px-1 pb-4">أرسل لنا رسالة</p>

                                {sent ? (
                                    <div className="text-center py-8 space-y-2">
                                        <div className="text-5xl mb-3">✅</div>
                                        <p className="font-bold text-gray-900">تم إرسال رسالتك!</p>
                                        <p className="text-sm text-gray-400">سنتواصل معك في أقرب وقت</p>
                                        <button
                                            onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                            className="mt-3 text-xs text-[#800000] font-semibold"
                                        >
                                            إرسال رسالة أخرى
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className={labelClass}>الاسم</label>
                                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>البريد الإلكتروني</label>
                                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>الموضوع</label>
                                            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} required>
                                                <option value="">اختر الموضوع</option>
                                                    <option value="دعم تقني">دعم تقني</option>
                                                    <option value="فواتير واشتراكات">فواتير واشتراكات</option>
                                                    <option value="اقتراح أو ملاحظة">اقتراح أو ملاحظة</option>
                                                    <option value="شراكة تجارية">شراكة تجارية</option>
                                                    <option value="أخرى">أخرى</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>الرسالة</label>
                                            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." rows={4} className={`${inputClass} resize-none`} required />
                                        </div>
                                        <button type="submit" disabled={sending} className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-bold text-sm active:opacity-90 disabled:opacity-50 transition-opacity">
                                            {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
                                        </button>
                                    </form>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
