import { useState, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { parseYmdHmLocal, parseYmdLocal } from "../../utils/datetime";

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
const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

const COLORS = [
    { bg: "#fff9f0", border: "#f59e0b", dot: "#f59e0b" },
    { bg: "#f0fdf4", border: "#22c55e", dot: "#22c55e" },
    { bg: "#eff6ff", border: "#3b82f6", dot: "#3b82f6" },
    { bg: "#fdf4ff", border: "#a855f7", dot: "#a855f7" },
    { bg: "#fff1f2", border: "#f43f5e", dot: "#f43f5e" },
    { bg: "#f0fdfa", border: "#14b8a6", dot: "#14b8a6" },
];

const formatDate = (iso) => {
    if (!iso) return "";
    const d = /^\d{4}-\d{2}-\d{2}$/.test(String(iso))
        ? parseYmdLocal(String(iso))
        : new Date(iso);
    if (!d || Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "short", day: "numeric" });
};

const buildQS = (obj) => {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== "") p.set(k, String(v)); });
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
    if (csrf) p.set("_token", csrf);
    return p.toString();
};

const LS_KEY = "qmra_note_reminders";

const saveReminderToStorage = (key, title, body, date, time) => {
    try {
        const stored = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        stored[key] = { title, body, date, time };
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
    } catch {}
};

const removeReminderFromStorage = (key) => {
    try {
        const stored = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        delete stored[key];
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
    } catch {}
};

if (!window._qNoteAlarms) window._qNoteAlarms = {};

const playAlertSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 200, 400].forEach((offset, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = i === 1 ? 880 : 660;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.5, ctx.currentTime + offset / 1000);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset / 1000 + 0.35);
            osc.start(ctx.currentTime + offset / 1000);
            osc.stop(ctx.currentTime + offset / 1000 + 0.35);
        });
    } catch {}
};

const showReminderPopup = (title, body) => {
    playAlertSound();

    const existing = document.getElementById("_qmra_reminder_popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "_qmra_reminder_popup";
    popup.setAttribute("dir", "rtl");
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        font-family: Cairo, sans-serif;
    `;

    popup.innerHTML = `
        <div style="
            background: #fff; border-radius: 20px; padding: 28px 24px;
            max-width: 320px; width: 90%; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        ">
            <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
            <div style="font-size: 18px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; line-height: 1.4;">
                ${title || "تذكير"}
            </div>
            ${body ? `<div style="font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.6;">${body}</div>` : '<div style="margin-bottom:20px"></div>'}
            <button id="_qmra_reminder_close" style="
                background: #800000; color: #fff; border: none;
                border-radius: 14px; padding: 14px 40px;
                font-size: 15px; font-weight: 700; cursor: pointer;
                font-family: Cairo, sans-serif; width: 100%;
            ">حسناً</button>
        </div>
    `;

    document.body.appendChild(popup);

    const close = () => popup.remove();
    document.getElementById("_qmra_reminder_close").addEventListener("click", close);
    popup.addEventListener("click", (e) => { if (e.target === popup) close(); });
};

const armReminder = (key, title, body, date, time) => {
    if (!date || !time) return;

    if (window._qNoteAlarms[key]) {
        clearTimeout(window._qNoteAlarms[key]);
        delete window._qNoteAlarms[key];
    }

    const fireAt = parseYmdHmLocal(date, time);
    if (!fireAt || Number.isNaN(fireAt.getTime())) return;
    const delay  = fireAt.getTime() - Date.now();
    if (delay <= 0) { removeReminderFromStorage(key); return; }

    window._qNoteAlarms[key] = setTimeout(() => {
        showReminderPopup(title, body);
        removeReminderFromStorage(key);
        delete window._qNoteAlarms[key];
    }, delay);
};

const scheduleNoteReminder = (key, title, body, date, time) => {
    if (!date || !time) return;
    try {
        if (window.ReminderBridge?.scheduleReminder) {
            window.ReminderBridge.scheduleReminder(`note_${key}`, title, body, date, time, "/notes");
            return;
        }
        if ("Notification" in window && Notification.permission === "granted") {
            saveReminderToStorage(key, title, body, date, time);
            armReminder(key, title, body, date, time);
        }
    } catch {}
};

const restoreRemindersFromStorage = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        Object.entries(stored).forEach(([key, r]) => armReminder(key, r.title, r.body, r.date, r.time));
    } catch {}
};

export default function Notes({ notes = [] }) {
    const [modal, setModal]       = useState(null);
    const [active, setActive]     = useState(null);
    const [colorIdx, setColorIdx] = useState(0);
    const [search, setSearch]     = useState("");
    const [confirmDel, setConfirmDel] = useState(null);
    const [saving, setSaving]     = useState(false);

    useEffect(() => {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            restoreRemindersFromStorage();
        } else if (Notification.permission === "default") {
            Notification.requestPermission().then(perm => {
                if (perm === "granted") restoreRemindersFromStorage();
            });
        }
    }, []);

    const titleRef        = useRef(null);
    const contentRef      = useRef(null);
    const reminderDateRef = useRef(null);
    const reminderTimeRef = useRef(null);

    const openAdd  = () => { setColorIdx(0); setActive(null); setModal("add"); };
    const openEdit = (note) => { setColorIdx(note.colorIdx ?? 0); setActive(note); setModal("edit"); };
    const openView = (note) => { setActive(note); setModal("view"); };

    const saveNote = () => {
        const title        = titleRef.current?.value?.trim()      || "";
        const content      = contentRef.current?.value?.trim()    || "";
        const reminderDate = reminderDateRef.current?.value        || "";
        const reminderTime = reminderTimeRef.current?.value        || "";
        if (!title && !content) return;
        setSaving(true);
        const payload = { title, content, color_idx: colorIdx, reminder_date: reminderDate || null, reminder_time: reminderTime || null };
        const qs = buildQS(payload);
        if (modal === "add") {
            router.post(`/notes?${qs}`, {}, {
                onSuccess: () => {
                    setSaving(false); setModal(null);
                    if (reminderDate && reminderTime) {
                        scheduleNoteReminder(`new_${Date.now()}`, title, content.slice(0, 80), reminderDate, reminderTime);
                    }
                },
                onError: () => setSaving(false),
            });
        } else {
            router.put(`/notes/${active.id}?${qs}`, {}, {
                onSuccess: () => {
                    setSaving(false); setModal(null);
                    scheduleNoteReminder(active.id, title, content.slice(0, 80), reminderDate || null, reminderTime || null);
                },
                onError: () => setSaving(false),
            });
        }
    };

    const deleteNote = (id) => {
        router.delete(`/notes/${id}`, { preserveScroll: true });
        setConfirmDel(null);
        if (modal === "view") setModal(null);
    };

    const filtered = notes.filter(n =>
        (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (n.content || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Head title="المفكرة - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity">
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">المفكرة</h1>
                        <span className="mr-auto ml-4 text-xs text-gray-400">{notes.length} ملاحظة</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 pb-28 space-y-3">

                            <div className="relative">
                                <input
                                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="ابحث في ملاحظاتك..."
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400 pr-10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-base">🔍</span>
                            </div>

                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="text-5xl mb-4">📝</div>
                                    <p className="font-semibold text-gray-500 text-base">
                                        {search ? "لا توجد نتائج" : "لا توجد ملاحظات بعد"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {search ? "جرّب كلمة بحث أخرى" : "اضغط + لإضافة ملاحظة جديدة"}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {filtered.map(note => {
                                    return (
                                        <button key={note.id} onClick={() => openView(note)}
                                            className="text-right rounded-2xl p-3.5 shadow-sm active:scale-95 transition-transform bg-white border border-gray-100">
                                            <div className="flex items-start gap-1 mb-1.5">
                                                <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">
                                                    {note.title || "بدون عنوان"}
                                                </p>
                                            </div>
                                            {note.content && (
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-2">{note.content}</p>
                                            )}
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-xs text-gray-400">{formatDate(note.updatedAt ?? note.createdAt)}</p>
                                                {note.reminderDate && <span className="text-xs text-[#800000]">⏰</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="fixed left-1/2 -translate-x-1/2 flex justify-center pointer-events-none w-full max-w-sm bottom-fab-safe">
                        <button onClick={openAdd}
                            className="pointer-events-auto w-14 h-14 rounded-full bg-[#800000] text-white shadow-xl flex items-center justify-center active:opacity-80 transition-opacity">
                            <PlusIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* View modal */}
            {modal === "view" && active && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" dir="rtl">
                    <div className="w-full max-w-sm bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "85vh" }}>
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 text-base flex-1 ml-4">{active.title || "بدون عنوان"}</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(active)}
                                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 active:opacity-70">
                                    <EditIcon />
                                </button>
                                <button onClick={() => setConfirmDel(active.id)}
                                    className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500 active:opacity-70">
                                    <TrashIcon />
                                </button>
                                <button onClick={() => setModal(null)}
                                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold active:opacity-70">✕</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
                            <p className="text-xs text-gray-400 mb-3">{formatDate(active.updatedAt ?? active.createdAt)}</p>
                            {(active.reminderDate || active.reminderTime) && (
                                <div className="flex items-center gap-1.5 mb-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                    <span className="text-sm">⏰</span>
                                    <span className="text-xs text-amber-700 font-medium">
                                        {active.reminderDate}
                                        {active.reminderDate && active.reminderTime && " — "}
                                        {active.reminderTime}
                                    </span>
                                </div>
                            )}
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {active.content || <span className="text-gray-300 italic">لا يوجد محتوى</span>}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit modal */}
            {(modal === "add" || modal === "edit") && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" dir="rtl">
                    <div className="w-full max-w-sm bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "90vh" }}>
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 text-base">
                                {modal === "add" ? "ملاحظة جديدة" : "تعديل الملاحظة"}
                            </h2>
                            <button onClick={() => setModal(null)}
                                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold active:opacity-70">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">
                            <input ref={titleRef} type="text" defaultValue={active?.title ?? ""}
                                placeholder="العنوان"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400" />
                            <textarea ref={contentRef} defaultValue={active?.content ?? ""}
                                placeholder="اكتب ملاحظتك هنا..." rows={6}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400 resize-none" />

                            <div className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                                <p className="text-xs font-semibold text-gray-500">⏰ تنبيه (اختياري)</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">التاريخ</label>
                                        <input ref={reminderDateRef} type="date" defaultValue={active?.reminderDate ?? ""}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#800000]" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">الوقت</label>
                                        <input ref={reminderTimeRef} type="time" defaultValue={active?.reminderTime ?? ""}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#800000]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pb-8 pt-3 border-t border-gray-100">
                            <button onClick={saveNote} disabled={saving}
                                className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all bg-[#800000] text-white active:opacity-80 disabled:opacity-60">
                                {saving ? "جاري الحفظ..." : modal === "add" ? "حفظ الملاحظة" : "حفظ التعديلات"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDel && (
                <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center px-6" dir="rtl">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-4">
                        <div className="text-4xl">🗑️</div>
                        <p className="font-bold text-gray-900">حذف الملاحظة؟</p>
                        <p className="text-xs text-gray-400">لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDel(null)}
                                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 active:opacity-80">إلغاء</button>
                            <button onClick={() => deleteNote(confirmDel)}
                                className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold active:opacity-80">حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
