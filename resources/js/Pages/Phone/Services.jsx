import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";

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

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

// ─── Add Service Modal ────────────────────────────────────────────────────────

const RECURRENCE_OPTIONS = [
    { value: "once",    label: "مرة واحدة",    km: null,  days: null },
    { value: "1month",  label: "كل شهر",        km: null,  days: 30 },
    { value: "2months", label: "كل شهرين",      km: null,  days: 60 },
    { value: "3months", label: "كل 3 أشهر",    km: null,  days: 90 },
    { value: "6months", label: "كل 6 أشهر",    km: null,  days: 180 },
    { value: "1year",   label: "كل سنة",        km: null,  days: 365 },
    { value: "1000km",  label: "كل 1,000 كم",  km: 1000,  days: null },
    { value: "2000km",  label: "كل 2,000 كم",  km: 2000,  days: null },
    { value: "5000km",  label: "كل 5,000 كم",  km: 5000,  days: null },
    { value: "10000km", label: "كل 10,000 كم", km: 10000, days: null },
    { value: "20000km", label: "كل 20,000 كم", km: 20000, days: null },
];

const AddServiceModal = ({ vehicleId, allServices, existingServiceIds, onClose }) => {
    const [form, setForm] = useState({ serviceId: "", recurrence: "", notes: "", cost: "" });
    const [submitting, setSubmitting] = useState(false);

    const availableServices = allServices.filter((s) => !existingServiceIds.includes(s.id));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.serviceId || submitting) return;
        const rec = RECURRENCE_OPTIONS.find(o => o.value === form.recurrence);
        setSubmitting(true);
        router.post(
            "/services",
            {
                vehicle_id:    vehicleId,
                service_id:    Number(form.serviceId),
                interval_km:   rec?.km   ?? null,
                interval_days: rec?.days ?? null,
                due_date:      null,
                cost:          form.cost  || null,
                notes:         form.notes || null,
            },
            { onFinish: () => { setSubmitting(false); onClose(); } }
        );
    };

    const inputClass =
        "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-5 pb-10 safe-bottom space-y-4">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
                <h2 className="font-bold text-gray-900 text-lg">إضافة خدمة</h2>

                {availableServices.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                        تم إضافة جميع الخدمات المتاحة لهذه المركبة.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                نوع الخدمة <span className="text-[#800000]">*</span>
                            </label>
                            <select
                                value={form.serviceId}
                                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                                className={inputClass}
                                required
                            >
                                <option value="">اختر خدمة</option>
                                {availableServices.map((s) => (
                                    <option key={s.id} value={s.id}>{s.icon} {s.nameAr}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                التكرار <span className="text-[#800000]">*</span>
                            </label>
                            <select
                                value={form.recurrence}
                                onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
                                className={inputClass}
                                required
                            >
                                <option value="">اختر التكرار</option>
                                {RECURRENCE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">التكلفة</label>
                            <input
                                type="text"
                                value={form.cost}
                                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                placeholder="1000 ر.س"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">ملاحظات</label>
                            <input
                                type="text"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="ملاحظات اختيارية"
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {submitting ? "جاري الإضافة..." : "إضافة الخدمة"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

// ─── Delete Confirm Sheet ─────────────────────────────────────────────────────

const DeleteSheet = ({ vsId, serviceName, onClose }) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (deleting) return;
        setDeleting(true);
        router.delete(`/services/${vsId}`, {
            onFinish: () => {
                setDeleting(false);
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-5 pb-10 safe-bottom space-y-4">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
                <h2 className="font-bold text-gray-900 text-lg">حذف الخدمة</h2>
                <p className="text-sm text-gray-500">
                    هل تريد حذف خدمة <span className="font-semibold text-gray-800">{serviceName}</span>؟ لا يمكن التراجع.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold text-sm"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-600 text-white rounded-xl py-3 font-semibold text-sm disabled:opacity-60"
                    >
                        {deleting ? "جاري الحذف..." : "حذف"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Service Row ─────────────────────────────────────────────────────────────

const ServiceRow = ({ vs, allServices, onDelete }) => {
    const service = allServices.find((s) => s.id === vs.serviceId);

    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <span className="text-xl leading-none">{service?.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{service?.nameAr}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {(() => {
                        const rec = RECURRENCE_OPTIONS.find(o =>
                            (o.km   && o.km   === vs.intervalKm)   ||
                            (o.days && o.days === vs.intervalDays) ||
                            (!vs.intervalKm && !vs.intervalDays && o.value === "once")
                        );
                        return rec ? <span className="text-xs text-gray-400">{rec.label}</span> : null;
                    })()}
                    {vs.cost && <span className="text-xs text-gray-400">&bull; {vs.cost} ر.س</span>}
                    {vs.notes && <span className="text-xs text-gray-300">&bull; {vs.notes}</span>}
                </div>
            </div>
            <button
                onClick={() => onDelete(vs.id, service?.nameAr ?? "الخدمة")}
                className="w-8 h-8 flex items-center justify-center text-gray-300 active:text-red-500 transition-colors shrink-0"
            >
                <TrashIcon />
            </button>
        </div>
    );
};

// ─── Vehicle Section ──────────────────────────────────────────────────────────

const VehicleSection = ({ vehicle, vehicleServicesList, allServices, onAddService, onDelete }) => {
    const VIcon = vehicle.type === "suv" ? SuvIcon : CarIcon;

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
                    <p className="font-bold text-gray-900 text-sm">{vehicle.nameAr}</p>
                    <p className="text-xs text-gray-400">{vehicle.plateNumber}</p>
                </div>
                <button
                    onClick={() => onAddService(vehicle.id)}
                    className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-white active:opacity-80 transition-opacity shrink-0"
                >
                    <PlusIcon />
                </button>
            </div>

            <div className="px-4">
                {vehicleServicesList.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-5">
                        لا توجد خدمات — اضغط + لإضافة خدمة
                    </p>
                ) : (
                    vehicleServicesList.map((vs) => (
                        <ServiceRow
                            key={vs.id}
                            vs={vs}
                            allServices={allServices}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Services({ vehicles = [], services = [], vehicleServices = [], defaultVehicleId = null }) {
    const [modalVehicleId, setModalVehicleId] = useState(
        defaultVehicleId ? Number(defaultVehicleId) : null
    );
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

    const modalVehicle = modalVehicleId
        ? vehicles.find((v) => v.id === modalVehicleId)
        : null;

    const existingServiceIds = modalVehicleId
        ? vehicleServices.filter((vs) => vs.vehicleId === modalVehicleId).map((vs) => vs.serviceId)
        : [];

    return (
        <>
            <Head title="الخدمات - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">الخدمات</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 pb-10 space-y-4">
                            {vehicles.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-16">
                                    لا توجد مركبات — أضف مركبة أولاً
                                </p>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <VehicleSection
                                        key={vehicle.id}
                                        vehicle={vehicle}
                                        vehicleServicesList={vehicleServices.filter((vs) => vs.vehicleId === vehicle.id)}
                                        allServices={services}
                                        onAddService={(vid) => setModalVehicleId(vid)}
                                        onDelete={(id, name) => setDeleteTarget({ id, name })}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modalVehicleId !== null && modalVehicle && (
                <AddServiceModal
                    vehicleId={modalVehicleId}
                    allServices={services}
                    existingServiceIds={existingServiceIds}
                    onClose={() => setModalVehicleId(null)}
                />
            )}

            {deleteTarget !== null && (
                <DeleteSheet
                    vsId={deleteTarget.id}
                    serviceName={deleteTarget.name}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}
