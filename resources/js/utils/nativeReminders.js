/**
 * NativePHP / Android WebView injects ReminderBridge for AlarmManager-based notifications.
 * `window.Notification` in WebView is often missing, disabled, or only works while the app is open.
 */
import { parseYmdHmLocal } from "./datetime";

export const hasReminderBridge = () =>
    typeof window !== "undefined" &&
    window.ReminderBridge &&
    typeof window.ReminderBridge.scheduleReminder === "function" &&
    typeof window.ReminderBridge.cancelReminder === "function";

const hasBrowserNotifications = () =>
    typeof window !== "undefined" && "Notification" in window;

/**
 * Web fallback only: APK uses ReminderBridge (AlarmManager), not the Web Notification API.
 */
export async function requestWebNotificationPermissionIfPossible() {
    if (hasReminderBridge()) return true;
    if (!hasBrowserNotifications()) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
}

const atNineLocal = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T09:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Cancel orphan alarms (removed vehicle/warranty), then schedule 09:00 on each future expiry.
 * @param {React.MutableRefObject<Set<string>>} prevKeySetRef tracks last scheduled alarm ids
 */
export function reconcileExpiryAlarms(prevKeySetRef, { vehicles = [], warranties = [], isAr = true }) {
    if (!hasReminderBridge()) return;

    const next = new Set();
    vehicles.forEach((v) => {
        next.add(`exp_reg_${v.id}`);
        next.add(`exp_ins_${v.id}`);
    });
    warranties.forEach((w) => next.add(`exp_war_${w.id}`));

    prevKeySetRef.current.forEach((id) => {
        if (!next.has(id)) {
            window.ReminderBridge.cancelReminder(id);
        }
    });
    prevKeySetRef.current = next;

    vehicles.forEach((v) => {
        const name = isAr ? v.nameAr : v.nameEn;
        const scheduleOne = (dateStr, suffix, labelAr, labelEn) => {
            if (!dateStr) return;
            const when = atNineLocal(dateStr);
            if (!when || when.getTime() <= Date.now()) return;
            const label = isAr ? labelAr : labelEn;
            const id = `exp_${suffix}_${v.id}`;
            window.ReminderBridge.scheduleReminder(
                id,
                `⏰ ${label}`,
                `${name} — ${dateStr}`,
                dateStr,
                "09:00",
                "/",
            );
        };
        scheduleOne(v.registrationExpiry, "reg", "تسجيل المركبة", "Registration");
        scheduleOne(v.insuranceExpiry, "ins", "التأمين", "Insurance");
    });

    warranties.forEach((w) => {
        if (!w.expiryDate) return;
        const when = atNineLocal(w.expiryDate);
        if (!when || when.getTime() <= Date.now()) return;
        const title = isAr ? "انتهاء ضمان" : "Warranty expiry";
        const sub = isAr ? w.titleAr : w.titleEn;
        window.ReminderBridge.scheduleReminder(
            `exp_war_${w.id}`,
            title,
            sub || "",
            w.expiryDate,
            "09:00",
            "/warranty",
        );
    });
}
