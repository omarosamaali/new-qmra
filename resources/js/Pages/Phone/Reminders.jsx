import { useEffect, useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
);
const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

const today = new Date();
today.setHours(0, 0, 0, 0);

const to12h = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "م" : "ص";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const isUpcoming = (r) => !r.completed && (!r.dueDate || new Date(r.dueDate) >= today);
const isPast     = (r) => !r.completed && r.dueDate && new Date(r.dueDate) < today;
const isDone     = (r) => r.completed;

const hasReminderBridge = () =>
    typeof window !== "undefined" &&
    window.ReminderBridge &&
    typeof window.ReminderBridge.scheduleReminder === "function" &&
    typeof window.ReminderBridge.cancelReminder === "function";

const parseReminderDateTime = (dueDate, dueTime) => {
    if (!dueDate) return null;
    const normalizedTime = dueTime && dueTime.length >= 5 ? dueTime.slice(0, 5) : "09:00";
    const value = new Date(`${dueDate}T${normalizedTime}:00`);
    return Number.isNaN(value.getTime()) ? null : value;
};

const scheduleReminderNative = (reminder) => {
    if (!hasReminderBridge()) return;
    if (reminder.completed || !reminder.dueDate) {
        window.ReminderBridge.cancelReminder(String(reminder.id));
        return;
    }

    const scheduledAt = parseReminderDateTime(reminder.dueDate, reminder.dueTime);
    if (!scheduledAt || scheduledAt.getTime() <= Date.now()) {
        window.ReminderBridge.cancelReminder(String(reminder.id));
        return;
    }

    const title = reminder.titleAr || "تنبيه قمرة";
    const body = reminder.notes?.trim() || "لديك تذكير مستحق الآن";
    const route = "/reminders";
    window.ReminderBridge.scheduleReminder(
        String(reminder.id),
        title,
        body,
        reminder.dueDate,
        reminder.dueTime || "",
        route
    );
};

const cancelReminderNative = (id) => {
    if (!hasReminderBridge()) return;
    window.ReminderBridge.cancelReminder(String(id));
};

const syncReminderSchedules = (reminders) => {
    if (!hasReminderBridge()) return;
    reminders.forEach((reminder) => {
        if (reminder.completed || !reminder.dueDate) {
            cancelReminderNative(reminder.id);
            return;
        }
        scheduleReminderNative(reminder);
    });
};

const buildReminderQueryString = (payload) => {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, val]) => {
        if (val === undefined || val === null) return;
        params.append(key, typeof val === "number" ? String(val) : val);
    });

    const csrf = typeof document !== "undefined"
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
        : "";
    if (csrf) params.append("_token", csrf);

    return params.toString();
};


function ReminderCard({ reminder, vehicles, onComplete, onDelete, onEdit }) {
    const vehicle = vehicles.find((v) => v.id === reminder.vehicleId);
    const done    = isDone(reminder);

    const borderColor = done ? "border-green-300" : "border-[#800000]";

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-r-4 ${borderColor} ${done ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-sm ${done ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {reminder.titleAr}
                    </p>
                    {vehicle && (
                        <p className="text-xs text-gray-400 mt-0.5">{vehicle.nameAr} &bull; {vehicle.plateNumber}</p>
                    )}
                    {reminder.notes && (
                        <p className="text-xs text-gray-500 mt-1">{reminder.notes}</p>
                    )}
                </div>
                {(reminder.dueDate || reminder.dueTime) && (
                    <div className="shrink-0 text-left flex flex-col items-end gap-0.5">
                        {reminder.dueDate && (
                            <p className={`text-xs font-bold ${done ? "text-gray-400" : "text-[#800000]"}`}>
                                📅 {reminder.dueDate}
                            </p>
                        )}
                        {reminder.dueTime && (
                            <p className={`text-xs ${done ? "text-gray-400" : "text-gray-500"}`}>
                                ⏰ {to12h(reminder.dueTime)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {!done && (
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                    <button
                        onClick={() => onComplete(reminder.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium active:bg-green-100"
                    >
                        <CheckIcon /> تم
                    </button>
                    <button
                        onClick={() => onEdit(reminder)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium active:bg-gray-100"
                    >
                        <EditIcon /> تعديل
                    </button>
                    <button
                        onClick={() => onDelete(reminder.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium active:bg-red-100 mr-auto"
                    >
                        <TrashIcon /> حذف
                    </button>
                </div>
            )}
            {done && (
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50 justify-end">
                    <button
                        onClick={() => onDelete(reminder.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium active:bg-red-100"
                    >
                        <TrashIcon /> حذف
                    </button>
                </div>
            )}
        </div>
    );
}

function ReminderModal({ vehicles, reminder, onClose }) {
    const isEdit = !!reminder;
    const [vehicleId, setVehicleId] = useState(reminder?.vehicleId ?? (vehicles[0]?.id ?? ""));
    const [saving, setSaving]       = useState(false);

    const titleRef   = useRef(null);
    const notesRef   = useRef(null);
    const dueDateRef = useRef(null);
    const dueTimeRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const titleAr = titleRef.current?.value?.trim()   || "";
        const notes   = notesRef.current?.value?.trim()   || "";
        const dueDate = dueDateRef.current?.value          || "";
        const dueTime = dueTimeRef.current?.value          || "";
        if (!titleAr || !vehicleId) return;
        setSaving(true);
        const payload = {
            vehicle_id: vehicleId,
            title_ar:   titleAr,
            notes:      notes   || null,
            due_date:   dueDate || null,
            due_time:   dueTime || null,
        };
        const qs = buildReminderQueryString(payload);
        const opts = {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: () => setSaving(false),
        };
        if (isEdit) {
            router.put(`/reminders/${reminder.id}?${qs}`, {}, opts);
        } else {
            router.post(`/reminders?${qs}`, {}, opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
            <div
                className="w-full max-w-sm bg-white rounded-t-3xl p-6 safe-bottom"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                <h2 className="text-lg font-bold text-gray-900 mb-5" dir="rtl">
                    {isEdit ? "تعديل التذكير" : "تذكير جديد"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">السيارة</label>
                        <select
                            value={vehicleId}
                            onChange={e => setVehicleId(Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-[#800000]"
                        >
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.nameAr} — {v.plateNumber}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">العنوان</label>
                        <input
                            ref={titleRef}
                            type="text"
                            defaultValue={reminder?.titleAr ?? ""}
                            placeholder="مثال: تغيير الزيت"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-[#800000]"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">الوصف (اختياري)</label>
                        <textarea
                            ref={notesRef}
                            defaultValue={reminder?.notes ?? ""}
                            placeholder="أضف تفاصيل أو ملاحظات..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-[#800000] resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">التاريخ (اختياري)</label>
                            <input
                                ref={dueDateRef}
                                type="date"
                                defaultValue={reminder?.dueDate ?? ""}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-[#800000]"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">الوقت (اختياري)</label>
                            <input
                                ref={dueTimeRef}
                                type="time"
                                defaultValue={reminder?.dueTime ?? ""}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-[#800000]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-[#800000] text-white rounded-xl font-bold text-sm active:bg-[#600000] disabled:opacity-50 mt-2"
                    >
                        {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة التذكير"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Reminders({ vehicles = [], reminders = [] }) {
    const [filter, setFilter]             = useState("upcoming");
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [showModal, setShowModal]       = useState(false);
    const [editReminder, setEditReminder] = useState(null);

    const filtered = reminders
        .filter((r) => {
            if (filter === "upcoming") return isUpcoming(r);
            if (filter === "past")     return isPast(r);
            if (filter === "done")     return isDone(r);
            return true;
        })
        .filter((r) => !selectedVehicleId || r.vehicleId === selectedVehicleId)
        .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            if (filter === "past") return new Date(b.dueDate) - new Date(a.dueDate);
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

    const upcomingCount = reminders.filter(isUpcoming).length;
    const pastCount     = reminders.filter(isPast).length;
    const doneCount     = reminders.filter(isDone).length;

    useEffect(() => {
        syncReminderSchedules(reminders);
    }, [reminders]);

    const handleComplete = (id) => {
        cancelReminderNative(id);
        router.post(`/reminders/${id}/complete`, {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (!confirm("تأكيد الحذف؟")) return;
        cancelReminderNative(id);
        router.delete(`/reminders/${id}`, { preserveScroll: true });
    };

    const handleEdit = (reminder) => {
        setEditReminder(reminder);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditReminder(null);
    };

    const tabClass = (key) =>
        `flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
            filter === key ? "bg-[#800000] text-white shadow-sm" : "text-gray-500"
        }`;

    return (
        <>
            <Head title="التنبيهات - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    {/* Header */}
                    <div className="bg-white sticky top-0 z-20 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.get("/")}
                                className="w-9 h-14 flex items-center justify-center bg-[#800000] text-white active:bg-[#600000] transition-colors"
                            >
                                <BackIcon />
                            </button>
                            <h1 className="font-bold text-gray-900 text-lg flex-1">التنبيهات</h1>
                            {vehicles.length > 0 && (
                                <button
                                    onClick={() => { setEditReminder(null); setShowModal(true); }}
                                    className="ml-3 mr-3 w-9 h-9 flex items-center justify-center bg-[#800000] text-white rounded-full active:bg-[#600000]"
                                >
                                    <PlusIcon />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 pt-3 rounded-xl mx-2">
                        <button onClick={() => setFilter("upcoming")} className={tabClass("upcoming")}>
                            القادمة ({upcomingCount})
                        </button>
                        <button onClick={() => setFilter("past")} className={tabClass("past")}>
                            المتأخرة ({pastCount})
                        </button>
                        <button onClick={() => setFilter("done")} className={tabClass("done")}>
                            المكتملة ({doneCount})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 pb-10 space-y-4">

                            {/* Vehicle filter */}
                            {vehicles.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    <button
                                        onClick={() => setSelectedVehicleId(null)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${
                                            !selectedVehicleId ? "bg-[#800000] text-white" : "bg-white text-gray-700 shadow-sm"
                                        }`}
                                    >
                                        الكل
                                    </button>
                                    {vehicles.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVehicleId(prev => prev === v.id ? null : v.id)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${
                                                selectedVehicleId === v.id ? "bg-[#800000] text-white" : "bg-white text-gray-700 shadow-sm"
                                            }`}
                                        >
                                            <span className="block">{v.nameAr}</span>
                                            <span className={`block text-xs font-normal mt-0.5 ${selectedVehicleId === v.id ? "text-white/70" : "text-gray-400"}`}>
                                                {v.plateNumber}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-gray-400">{filtered.length} تذكير</p>

                            {filtered.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center space-y-3">
                                    <p className="text-3xl">🔔</p>
                                    <p className="text-gray-400 text-sm">
                                        {filter === "upcoming" ? "لا توجد تذكيرات قادمة"
                                        : filter === "past"    ? "لا توجد تذكيرات متأخرة"
                                        : "لا توجد تذكيرات مكتملة"}
                                    </p>
                                    {filter === "upcoming" && vehicles.length > 0 && (
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="mx-auto flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-xl text-sm font-medium"
                                        >
                                            <PlusIcon /> أضف تذكيراً
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filtered.map((r) => (
                                        <ReminderCard
                                            key={r.id}
                                            reminder={r}
                                            vehicles={vehicles}
                                            onComplete={handleComplete}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <ReminderModal
                    vehicles={vehicles}
                    reminder={editReminder}
                    onClose={closeModal}
                />
            )}
        </>
    );
}
