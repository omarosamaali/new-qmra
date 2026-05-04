import { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { useLanguage } from "../../utils/language";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

const CarIcon = ({ color = "#666", className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
);

const SuvIcon = ({ color = "#666", className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M20 8h-3L14 4H5C3.9 4 3 4.9 3 6v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM8 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12-3h-1.73c-.41-.59-1.07-1-1.77-1s-1.36.41-1.77 1H10.5c-.41-.59-1.07-1-1.77-1s-1.36.41-1.77 1H5V6h8.5l3 4H20v5zm-4 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-04-06");

const warrantyStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry - TODAY) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)  return "expired";
    if (diffDays < 90) return "soon";
    return "active";
};

const statusColors = {
    expired: { dot: "bg-red-400",   badge: "bg-red-50 text-red-500" },
    soon:    { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600" },
    active:  { dot: "bg-green-400", badge: "bg-green-50 text-green-600" },
};

const formatExpiry = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

// ─── Add Warranty Modal ───────────────────────────────────────────────────────

const WARRANTY_TYPES = [
    { ar: "ضمان المصنع الشامل",        en: "Comprehensive Warranty",      icon: "🛡️" },
    { ar: "ضمان محرك وناقل الحركة",    en: "Powertrain Warranty",         icon: "⚙️" },
    { ar: "ضمان الصدأ",                en: "Rust Warranty",               icon: "🔩" },
    { ar: "ضمان الطلاء",               en: "Paint Warranty",              icon: "🎨" },
    { ar: "ضمان قطعة غيار",            en: "Spare Parts Warranty",        icon: "🔧" },
    { ar: "ضمان إطارات",               en: "Tires Warranty",              icon: "🔄" },
    { ar: "ضمان بطارية",               en: "Battery Warranty",            icon: "🔋" },
    { ar: "أخرى",                      en: "Other",                       icon: "📋" },
];

const WARRANTY_RECURRENCE = [
    { value: "once",    ar: "مرة واحدة",     en: "Once" },
    { value: "1month",  ar: "كل شهر",         en: "Every month" },
    { value: "2months", ar: "كل شهرين",       en: "Every 2 months" },
    { value: "3months", ar: "كل 3 أشهر",     en: "Every 3 months" },
    { value: "6months", ar: "كل 6 أشهر",     en: "Every 6 months" },
    { value: "1year",   ar: "كل سنة",         en: "Every year" },
    { value: "1000km",  ar: "كل 1,000 كم",   en: "Every 1,000 km" },
    { value: "2000km",  ar: "كل 2,000 كم",   en: "Every 2,000 km" },
    { value: "5000km",  ar: "كل 5,000 كم",   en: "Every 5,000 km" },
    { value: "10000km", ar: "كل 10,000 كم",  en: "Every 10,000 km" },
    { value: "20000km", ar: "كل 20,000 كم",  en: "Every 20,000 km" },
];

const AddWarrantyModal = ({ onClose, onAdd, t, isAr }) => {
    const [titleAr,    setTitleAr]    = useState("");
    const [titleEn,    setTitleEn]    = useState("");
    const [icon,       setIcon]       = useState("🛡️");
    const [recurrence, setRecurrence] = useState("");

    const customTitleRef = useRef(null);
    const providerRef    = useRef(null);
    const costRef        = useRef(null);
    const notesRef       = useRef(null);

    const isOther = titleAr === "أخرى";

    const handleTypeSelect = (e) => {
        const selected = WARRANTY_TYPES.find(w => w.ar === e.target.value);
        if (selected) { setTitleAr(selected.ar); setTitleEn(selected.en); setIcon(selected.icon); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!titleAr) return;
        const customTitle = customTitleRef.current?.value?.trim() || "";
        if (isOther && !customTitle) return;
        const finalTitleAr = isOther ? customTitle : titleAr;
        const finalTitleEn = isOther ? customTitle : titleEn;
        onAdd({
            titleAr:    finalTitleAr,
            titleEn:    finalTitleEn,
            icon,
            recurrence,
            provider:   providerRef.current?.value?.trim() || "",
            cost:       costRef.current?.value?.trim()     || "",
            notes:      notesRef.current?.value?.trim()    || "",
        });
    };

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-5 pb-10 safe-bottom space-y-4">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
                <h2 className="font-bold text-gray-900 text-lg">{t("إضافة ضمان", "Add Warranty")}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("نوع الضمان", "Warranty Type")} <span className="text-[#800000]">*</span>
                        </label>
                        <select value={titleAr} onChange={handleTypeSelect} className={inputClass} required>
                            <option value="">{t("اختر نوع الضمان", "Select warranty type")}</option>
                            {WARRANTY_TYPES.map(w => (
                                <option key={w.ar} value={w.ar}>{w.icon} {isAr ? w.ar : w.en}</option>
                            ))}
                        </select>
                    </div>

                    {isOther && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t("عنوان الضمان", "Warranty Title")} <span className="text-[#800000]">*</span>
                            </label>
                            <input
                                ref={customTitleRef}
                                type="text"
                                defaultValue=""
                                placeholder={t("مثال: ضمان المحرك", "e.g. Engine Warranty")}
                                className={inputClass}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("التكرار", "Recurrence")}
                        </label>
                        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className={inputClass}>
                            <option value="">{t("اختر التكرار", "Select recurrence")}</option>
                            {WARRANTY_RECURRENCE.map(o => (
                                <option key={o.value} value={o.value}>{isAr ? o.ar : o.en}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("الجهة", "Provider")}
                        </label>
                        <input ref={providerRef} type="text" defaultValue="" placeholder={t("مثال: Toyota Abu Dhabi", "e.g. Toyota Abu Dhabi")} className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">التكلفة</label>
                        <input ref={costRef} type="text" defaultValue="" placeholder="ae 1000" className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("ملاحظات", "Notes")}
                        </label>
                        <input ref={notesRef} type="text" defaultValue="" placeholder="..." className={inputClass} />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity"
                    >
                        {t("إضافة الضمان", "Add Warranty")}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Warranty Row ─────────────────────────────────────────────────────────────

const WarrantyRow = ({ warranty, isAr }) => {
    const status = warrantyStatus(warranty.expiryDate);
    const colors = statusColors[status];
    const statusLabel = { expired: isAr ? "منتهي" : "Expired", soon: isAr ? "قريباً" : "Expiring Soon", active: isAr ? "ساري" : "Active" };

    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <span className="text-xl leading-none">{warranty.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">
                        {isAr ? warranty.titleAr : warranty.titleEn}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${colors.badge}`}>
                        {statusLabel[status]}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{formatExpiry(warranty.expiryDate)}</span>
                    {warranty.provider && (
                        <span className="text-xs text-gray-300">&bull; {warranty.provider}</span>
                    )}
                </div>
            </div>
            <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
        </div>
    );
};

// ─── Vehicle Section ──────────────────────────────────────────────────────────

const VehicleSection = ({ vehicle, vehicleWarranties, onAdd, isAr, t }) => {
    const VIcon = vehicle.type === "suv" ? SuvIcon : CarIcon;

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: vehicle.color + "20" }}
                >
                    <VIcon color={vehicle.color} className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">
                        {isAr ? vehicle.nameAr : vehicle.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">{vehicle.plateNumber}</p>
                </div>
                <button
                    onClick={() => onAdd(vehicle.id)}
                    className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-white active:opacity-80 transition-opacity shrink-0"
                >
                    <PlusIcon />
                </button>
            </div>

            <div className="px-4">
                {vehicleWarranties.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-5">
                        {t("لا توجد ضمانات — اضغط + لإضافة ضمان", "No warranties — tap + to add one")}
                    </p>
                ) : (
                    vehicleWarranties.map((w) => (
                        <WarrantyRow key={w.id} warranty={w} isAr={isAr} />
                    ))
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Warranty({ vehicles = [], warranties = [], defaultVehicleId = null }) {
    const { isAr, t } = useLanguage();
    const [modalVehicleId, setModalVehicleId] = useState(
        defaultVehicleId ? Number(defaultVehicleId) : null
    );

    const handleAdd = (form) => {
        const q = new URLSearchParams();
        q.set("vehicle_id", String(modalVehicleId));
        q.set("titleAr", form.titleAr);
        q.set("titleEn", form.titleEn);
        q.set("icon", form.icon);
        if (form.provider) q.set("provider", form.provider);
        if (form.notes) q.set("notes", form.notes);
        router.post(`/warranty?${q.toString()}`, {}, { onSuccess: () => setModalVehicleId(null) });
    };

    return (
        <>
            <Head title={t("الضمان - قمرة", "Warranty - Qamra")} />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir={isAr ? "rtl" : "ltr"}>
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">{t("الضمان", "Warranty")}</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 pb-10 space-y-4">
                            {vehicles.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-16">
                                    {t("لا توجد مركبات — أضف مركبة أولاً", "No vehicles — add one first")}
                                </p>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <VehicleSection
                                        key={vehicle.id}
                                        vehicle={vehicle}
                                        vehicleWarranties={warranties.filter((w) => w.vehicleId === vehicle.id)}
                                        onAdd={(vid) => setModalVehicleId(vid)}
                                        isAr={isAr}
                                        t={t}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modalVehicleId !== null && (
                <AddWarrantyModal
                    vehicleId={modalVehicleId}
                    onClose={() => setModalVehicleId(null)}
                    onAdd={handleAdd}
                    t={t}
                    isAr={isAr}
                />
            )}
        </>
    );
}
