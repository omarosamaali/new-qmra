import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { brandsData } from "../../Components/BrandsData";
import { normalizeOdometerUnit, odometerSuffix } from "../../utils/units";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
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
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";

const formatKm = (km, unit = "km") => {
    const u = normalizeOdometerUnit(unit);
    const suf = odometerSuffix(u, true);
    return `${Number(km).toLocaleString("en")} ${suf}`;
};

const EditSheet = ({ vehicle, onClose, onSave }) => {
    const brandObj  = brandsData.find(b => b.en === vehicle.brand);
    const initModel = vehicle.nameEn.replace(vehicle.brand, "").trim();

    const [brand, setBrand] = useState(vehicle.brand ?? "");
    const [model, setModel] = useState(initModel);
    const [form,  setForm]  = useState({
        plateNumber:        vehicle.plateNumber,
        km:                 String(vehicle.km),
        unit:               normalizeOdometerUnit(vehicle.unit),
        year:               String(vehicle.year),
        registrationExpiry: vehicle.registrationExpiry || "",
        insuranceExpiry:    vehicle.insuranceExpiry    || "",
        notes:              vehicle.notes ?? "",
    });

    const selectedBrandObj = brandsData.find(b => b.en === brand);
    const models = selectedBrandObj?.models ?? [];
    const selectedModelObj = models.find(m => m.en === model);

    const handleSave = () => {
        const nameAr = `${selectedBrandObj?.ar ?? brand} ${selectedModelObj?.ar ?? model}`.trim();
        const nameEn = `${brand} ${model}`.trim();
        onSave({
            ...vehicle, ...form,
            brand,
            nameAr: nameAr || vehicle.nameAr,
            nameEn: nameEn || vehicle.nameEn,
            km: Number(form.km),
            year: Number(form.year),
            unit: normalizeOdometerUnit(form.unit),
            notes: form.notes?.trim() || null,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-4 pb-10 safe-bottom overflow-y-auto no-scrollbar" style={{ maxHeight: "90vh" }}>
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <h2 className="font-bold text-gray-900 text-lg mb-4" dir="rtl">تعديل المركبة</h2>

                <div className="space-y-4" dir="rtl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">الشركة المصنّعة</label>
                        <select value={brand} onChange={e => { setBrand(e.target.value); setModel(""); }} className={inputClass}>
                            <option value="">اختر الشركة</option>
                            {brandsData.map(b => <option key={b.en} value={b.en}>{b.ar}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">الموديل</label>
                        <select value={model} onChange={e => setModel(e.target.value)} disabled={!brand} className={`${inputClass} disabled:opacity-50`}>
                            <option value="">{brand ? "اختر الموديل" : "اختر الشركة أولاً"}</option>
                            {models.map(m => <option key={m.en} value={m.en}>{m.ar}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم اللوحة</label>
                        <input type="text" value={form.plateNumber} onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))} className={inputClass} dir="ltr" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">سنة الصنع</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={form.year}
                            onChange={e => {
                                const y = e.target.value.replace(/\D/g, "").slice(0, 4);
                                setForm(f => ({ ...f, year: y }));
                            }}
                            className={inputClass}
                            dir="ltr"
                            maxLength={4}
                            placeholder="2020"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع العداد</label>
                        <div className="flex gap-3">
                            {[{ v: "km", ar: "كيلومتر" }, { v: "mi", ar: "ميل" }].map(({ v, ar }) => (
                                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, unit: v }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                        form.unit === v ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}>
                                    {ar} <span className="font-bold">({v})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {form.unit === "mi" ? "العداد الحالي (ميل)" : "العداد الحالي (كم)"}
                        </label>
                        <div className="relative">
                            <input type="number" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} className={inputClass} dir="ltr" />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{odometerSuffix(form.unit, true)}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ انتهاء التسجيل</label>
                        <input type="date" value={form.registrationExpiry} onChange={e => setForm(f => ({ ...f, registrationExpiry: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ انتهاء التأمين</label>
                        <input type="date" value={form.insuranceExpiry} onChange={e => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ملاحظات (اختياري)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            rows={3}
                            placeholder="أي ملاحظات عن المركبة…"
                            className={`${inputClass} resize-none`}
                        />
                    </div>
                    <button onClick={handleSave} className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90">
                        حفظ التعديلات
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Vehicles({ vehicles: initVehicles = [] }) {
    const [vehicles, setVehicles] = useState(initVehicles);
    const [editing, setEditing]   = useState(null);
    const [deleting, setDeleting] = useState(null);

    const handleSave = (updated) => {
        setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
        router.put(`/vehicles/${updated.id}`, updated, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        setVehicles(prev => prev.filter(v => v.id !== id));
        setDeleting(null);
        router.delete(`/vehicles/${id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="مركباتي - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity">
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">مركباتي</h1>
                        <button onClick={() => router.get("/add-vehicle")}
                            className="mr-auto ml-4 w-9 h-9 bg-[#800000] rounded-full flex items-center justify-center text-white active:opacity-80">
                            <PlusIcon />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 space-y-3 pb-safe-nav">
                            {vehicles.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center">
                                    <p className="text-gray-400 text-sm">لا توجد مركبات — اضغط + لإضافة مركبة</p>
                                </div>
                            ) : vehicles.map(v => (
                                <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm">{v.nameAr}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{v.plateNumber} • {v.year}</p>
                                            <p className="text-sm font-semibold text-[#800000] mt-1">{formatKm(v.km, v.unit)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => setEditing(v)}
                                                className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 active:bg-gray-100">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => setDeleting(v)}
                                                className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:bg-red-100">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                    {(v.registrationExpiry || v.insuranceExpiry) && (
                                        <div className="mt-3 pt-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
                                            {v.registrationExpiry && <span>تسجيل: {v.registrationExpiry}</span>}
                                            {v.insuranceExpiry    && <span>تأمين: {v.insuranceExpiry}</span>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {editing && (
                <EditSheet vehicle={editing} onClose={() => setEditing(null)} onSave={handleSave} />
            )}

            {deleting && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDeleting(null)} />
                    <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-5 pb-10 safe-bottom space-y-4" dir="rtl">
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
                        <h2 className="font-bold text-gray-900 text-lg">حذف المركبة</h2>
                        <p className="text-sm text-gray-500">
                            هل تريد حذف <span className="font-semibold">{deleting.nameAr}</span>؟ لا يمكن التراجع.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleting(null)} className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold text-sm">إلغاء</button>
                            <button onClick={() => handleDelete(deleting.id)} className="flex-1 bg-red-600 text-white rounded-xl py-3 font-semibold text-sm">حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
