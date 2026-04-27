import { useState } from "react";
import { Head, router } from "@inertiajs/react";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

export default function Terms({ privacyPolicy, termsAndConditions }) {
    const [tab, setTab] = useState("terms");

    const content = tab === "terms" ? termsAndConditions : privacyPolicy;
    const label   = tab === "terms" ? "شروط الاستخدام" : "سياسة الخصوصية";
    return (
        <>
            <Head title={`${label} - قمرة`} />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">{label}</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white border-b border-gray-100 px-4 gap-2 pt-2 pb-0">
                        {[
                            { key: "terms",   label: "شروط الاستخدام" },
                            { key: "privacy", label: "سياسة الخصوصية" },
                        ].map(({ key, label: l }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                    tab === key
                                        ? "border-[#800000] text-[#800000]"
                                        : "border-transparent text-gray-400"
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 py-6 pb-16">
                            {content ? (
                                <div
                                    className="bg-white rounded-3xl p-5 shadow-sm text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-20">
                                    {tab === "terms" ? "لا تتوفر شروط الاستخدام حالياً" : "لا تتوفر سياسة الخصوصية حالياً"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
