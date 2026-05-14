/**
 * Service catalog icons by id — must stay aligned with HomeController & ServicesController.
 * Uses clearer automotive semantics (e.g. brakes use 🛞, not 🛑 which reads as a stop sign).
 */
export const SERVICE_ICONS_BY_ID = Object.freeze({
    1: "🛢️",
    2: "💨",
    3: "⛽",
    4: "🌬️",
    5: "⚡",
    6: "🛞",
    7: "🔄",
    8: "🎯",
    9: "⚖️",
    10: "🌡️",
    11: "💧",
    12: "🔧",
    13: "🔋",
    14: "⚙️",
    15: "🔗",
    16: "❄️",
    17: "🕯️",
    18: "🔍",
    19: "🌧️",
    20: "💡",
});

/** Merge server `services` rows with canonical icons. */
export function enrichServices(services) {
    if (!Array.isArray(services)) return [];
    return services.map((s) => {
        const id = Number(s.id);
        return {
            ...s,
            icon: (!Number.isNaN(id) && SERVICE_ICONS_BY_ID[id]) ? SERVICE_ICONS_BY_ID[id] : (s.icon ?? "🔧"),
        };
    });
}

/**
 * Icon for a reminder row when `service_id` is missing or unknown (free-text titles).
 */
export function resolveServiceIcon(serviceId, titleAr = "") {
    const id = serviceId != null && serviceId !== "" ? Number(serviceId) : null;
    if (id != null && !Number.isNaN(id) && SERVICE_ICONS_BY_ID[id]) {
        return SERVICE_ICONS_BY_ID[id];
    }
    const t = (titleAr || "").toLowerCase();
    if (/زيت|\boil\b/i.test(t)) return "🛢️";
    if (/فرامل|brake/i.test(t)) return "🛞";
    if (/كابين|cabin/i.test(t)) return "🌬️";
    if (/وقود|fuel/i.test(t)) return "⛽";
    if (/هواء|air\s*filter/i.test(t)) return "💨";
    if (/بواجي|spark/i.test(t)) return "⚡";
    if (/إطار|اطار|tire|tyre|rotation|موازنة|ضبط\s*الإطار/i.test(t)) return "🔄";
    if (/بطاري|battery/i.test(t)) return "🔋";
    if (/تكييف|\bac\b/i.test(t)) return "❄️";
    if (/تبريد|coolant/i.test(t)) return "🌡️";
    if (/إضاءة|light/i.test(t)) return "💡";
    if (/مساح|wiper/i.test(t)) return "🌧️";
    if (/فلتر/i.test(t)) return "💨";
    return "🔔";
}
