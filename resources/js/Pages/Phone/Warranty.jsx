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

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const warrantyStatus = (expiryDate) => {
    if (!expiryDate) return "active";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)  return "expired";
    if (diffDays < 90) return "soon";
    return "active";
};

const statusColors = {
    expired: { dot: "bg-red-400",   badge: "bg-red-50 text-red-500" },
    soon:    { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600" },
    active:  { dot: "bg-green-400", badge: "bg-green-50 text-green-600" },
};

const formatExpiry = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "short", year: "numeric" });
};

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

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";

// ─── Add Warranty Modal ───────────────────────────────────────────────────────

const AddWarrantyModal = ({ onClose, onAdd, t, isAr }) => {
    const [titleAr, setTitleAr] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [icon,    setIcon]    = useState("🛡️");

    const customTitleRef  = useRef(null);
    const providerRef     = useRef(null);
    const notesRef        = useRef(null);
    const expiryDateRef   = useRef(null);
    const invoiceRef      = useRef(null);

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
            titleAr:     finalTitleAr,
            titleEn:     finalTitleEn,
            icon,
            provider:    providerRef.current?.value?.trim()   || "",
            notes:       notesRef.current?.value?.trim()      || "",
            expiryDate:  expiryDateRef.current?.value         || "",
            invoiceNo:   invoiceRef.current?.value?.trim()    || "",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-5 pb-10 safe-bottom space-y-4 overflow-y-auto max-h-[90vh] no-scrollbar">
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
                            {t("تاريخ انتهاء الضمان", "Warranty Expiry Date")}
                        </label>
                        <input ref={expiryDateRef} type="date" defaultValue="" className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("الجهة", "Provider")}
                        </label>
                        <input ref={providerRef} type="text" defaultValue="" placeholder={t("مثال: Toyota", "e.g. Toyota")} className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("رقم الفاتورة", "Invoice Number")}
                        </label>
                        <input ref={invoiceRef} type="text" defaultValue="" placeholder={t("مثال: INV-12345", "e.g. INV-12345")} className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("ملاحظات", "Notes")}
                        </label>
                        <textarea ref={notesRef} defaultValue="" placeholder="..." rows={2} className={`${inputClass} resize-none`} />
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

// ─── Edit Warranty Modal ──────────────────────────────────────────────────────

const EditWarrantyModal = ({ warranty, onClose, onSave, t, isAr }) => {
    const providerRef   = useRef(null);
    const notesRef      = useRef(null);
    const expiryRef     = useRef(null);
    const invoiceRef    = useRef(null);
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        const q = new URLSearchParams();
        const provider   = providerRef.current?.value?.trim()  || "";
        const notes      = notesRef.current?.value?.trim()     || "";
        const expiryDate = expiryRef.current?.value            || "";
        const invoiceNo  = invoiceRef.current?.value?.trim()   || "";
        if (provider)   q.set("provider",    provider);
        if (notes)      q.set("notes",       notes);
        if (expiryDate) q.set("expiry_date", expiryDate);
        if (invoiceNo)  q.set("notes",       (notes ? notes + "\nفاتورة: " : "فاتورة: ") + invoiceNo);
        router.put(`/warranty/${warranty.id}?${q.toString()}`, {}, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); onClose(); },
            onError:   () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-5 pb-10 safe-bottom space-y-4">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
                <h2 className="font-bold text-gray-900 text-lg">{t("تعديل الضمان", "Edit Warranty")}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{warranty.icon}</span>
                    <span>{isAr ? warranty.titleAr : warranty.titleEn}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("تاريخ انتهاء الضمان", "Warranty Expiry Date")}
                        </label>
                        <input ref={expiryRef} type="date" defaultValue={warranty.expiryDate ?? ""} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("الجهة", "Provider")}
                        </label>
                        <input ref={providerRef} type="text" defaultValue={warranty.provider ?? ""} placeholder={t("مثال: Toyota", "e.g. Toyota")} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("رقم الفاتورة", "Invoice Number")}
                        </label>
                        <input ref={invoiceRef} type="text" defaultValue="" placeholder="INV-12345" className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("ملاحظات", "Notes")}
                        </label>
                        <textarea ref={notesRef} defaultValue={warranty.notes ?? ""} rows={2} className={`${inputClass} resize-none`} />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 disabled:opacity-60"
                    >
                        {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ التعديلات", "Save Changes")}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Warranty Row ─────────────────────────────────────────────────────────────

const WarrantyRow = ({ warranty, isAr, onEdit, onDelete }) => {
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
                    {warranty.expiryDate && (
                        <span className="text-xs text-gray-400">{formatExpiry(warranty.expiryDate)}</span>
                    )}
                    {warranty.provider && (
                        <span className="text-xs text-gray-300">&bull; {warranty.provider}</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={() => onEdit(warranty)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 active:text-[#800000] transition-colors"
                >
                    <EditIcon />
                </button>
                <button
                    onClick={() => onDelete(warranty.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 active:text-red-500 transition-colors"
                >
                    <TrashIcon />
                </button>
                <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
            </div>
        </div>
    );
};

// ─── Vehicle Section ──────────────────────────────────────────────────────────

const VehicleSection = ({ vehicle, vehicleWarranties, onAdd, onEdit, onDelete, isAr, t }) => {
    const VIcon = CarIcon;

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (vehicle.color || "#666") + "20" }}
                >
                    <VIcon color={vehicle.color || "#666"} className="w-6 h-6" />
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
                        <WarrantyRow key={w.id} warranty={w} isAr={isAr} onEdit={onEdit} onDelete={onDelete} />
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
    const [editingWarranty, setEditingWarranty] = useState(null);

    const handleAdd = (form) => {
        const q = new URLSearchParams();
        q.set("vehicle_id", String(modalVehicleId));
        q.set("titleAr",    form.titleAr);
        q.set("titleEn",    form.titleEn);
        q.set("icon",       form.icon);
        if (form.provider)   q.set("provider",    form.provider);
        if (form.notes)      q.set("notes",       form.notes);
        if (form.expiryDate) q.set("expiry_date", form.expiryDate);
        router.post(`/warranty?${q.toString()}`, {}, { onSuccess: () => setModalVehicleId(null) });
    };

    const handleDelete = (id) => {
        if (!confirm("تأكيد حذف الضمان؟")) return;
        router.delete(`/warranty/${id}`, { preserveScroll: true });
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
                        <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom) + 5rem), 6.5rem)" }}>
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
                                        onEdit={(w) => setEditingWarranty(w)}
                                        onDelete={handleDelete}
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

            {editingWarranty && (
                <EditWarrantyModal
                    warranty={editingWarranty}
                    onClose={() => setEditingWarranty(null)}
                    onSave={() => setEditingWarranty(null)}
                    t={t}
                    isAr={isAr}
                />
            )}
        </>
    );
}
