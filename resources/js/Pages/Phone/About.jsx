import { Head, router } from "@inertiajs/react";
import { logoDark } from "../../brand/assets";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

export default function About({ aboutUs }) {
    return (
        <>
            <Head title="اعرفنا - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">اعرفنا</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-6 pb-10">

                            <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center mb-5">
                                <img src={logoDark} alt="قمرة" className="h-20 object-contain mb-4" />
                                <h2 className="font-bold text-gray-900 text-xl mb-1">قمرة</h2>
                                <p className="text-xs text-gray-400">الإصدار 1.0.0</p>
                            </div>

                            {aboutUs ? (
                                <div className="bg-white rounded-3xl p-5 shadow-sm text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {aboutUs}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-10">
                                    لا تتوفر معلومات حالياً
                                </p>
                            )}

                            <div className="flex justify-center gap-4 text-xs text-gray-400 mt-6">
                                <button onClick={() => router.get("/terms")} className="underline underline-offset-2">سياسة الخصوصية</button>
                                <span>&bull;</span>
                                <button onClick={() => router.get("/terms")} className="underline underline-offset-2">شروط الاستخدام</button>
                            </div>

                            <p className="text-center text-xs text-gray-300 mt-4">© 2026 قمرة. جميع الحقوق محفوظة.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
