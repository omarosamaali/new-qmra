import { Head, router } from "@inertiajs/react";
import { useEffect } from "react";
import { useLanguage } from "../../utils/language";
import { requestWebNotificationPermissionIfPossible } from "../../utils/nativeReminders";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

const options = [
    {
        icon: "🔔",
        ar: "إضافة تذكير",
        en: "Add Reminder",
        route: "/reminders",
        desc_ar: "أضف تذكير لمركبتك",
        desc_en: "Add a reminder for your vehicle",
    },
    {
        icon: "🛢️",
        ar: "إضافة خدمة",
        en: "Add Service",
        route: "/services",
        desc_ar: "سجّل خدمة صيانة لمركبتك",
        desc_en: "Log a maintenance service",
    },
    {
        icon: "📝",
        ar: "إضافة مفكرة",
        en: "Add Note",
        route: "/notes",
        desc_ar: "أضف ملاحظة جديدة",
        desc_en: "Add a new note",
    },
    {
        icon: "🛡️",
        ar: "إضافة ضمان",
        en: "Add Warranty",
        route: "/warranty",
        desc_ar: "سجّل ضمان لمركبتك",
        desc_en: "Register a vehicle warranty",
    },
];

export default function Add() {
    const { isAr, t } = useLanguage();

    useEffect(() => {
        requestWebNotificationPermissionIfPossible();
    }, []);

    return (
        <>
            <Head title={t("إضافة - قمرة", "Add - Qamra")} />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir={isAr ? "rtl" : "ltr"}>
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">{t("إضافة", "Add")}</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-6 pb-10 space-y-3">
                            {options.map((opt) => (
                                <button
                                    key={opt.route}
                                    onClick={() => router.get(opt.route)}
                                    className="w-full bg-white rounded-2xl px-5 py-5 flex items-center gap-4 shadow-sm active:opacity-80 transition-opacity text-right"
                                    dir={isAr ? "rtl" : "ltr"}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 text-3xl">
                                        {opt.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-base">
                                            {isAr ? opt.ar : opt.en}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                            {isAr ? opt.desc_ar : opt.desc_en}
                                        </p>
                                    </div>
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-300 shrink-0" style={{ transform: isAr ? "rotate(180deg)" : "none" }}>
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
