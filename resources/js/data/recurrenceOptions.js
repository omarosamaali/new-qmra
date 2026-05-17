import { normalizeOdometerUnit, odometerSuffix } from "../utils/units";

const KM_INTERVALS = [1000, 2000, 5000, 10000, 20000];

export const RECURRENCE_OPTIONS = [
    { value: "once", label: "مرة واحدة", km: null, days: null },
    { value: "1month", label: "كل شهر", km: null, days: 30 },
    { value: "2months", label: "كل شهرين", km: null, days: 60 },
    { value: "3months", label: "كل 3 أشهر", km: null, days: 90 },
    { value: "6months", label: "كل 6 أشهر", km: null, days: 180 },
    { value: "1year", label: "كل سنة", km: null, days: 365 },
    ...KM_INTERVALS.map((km) => ({
        value: `${km}km`,
        km,
        days: null,
    })),
];

/** Arabic label for recurrence option; distance options use كم or ميل from vehicle unit. */
export function recurrenceLabel(o, unit = "km") {
    if (!o) return "";
    if (o.km == null) return o.label ?? "";
    const suffix = odometerSuffix(unit, true);
    return `كل ${o.km.toLocaleString("en")} ${suffix}`;
}

/** Store interval in km; option amounts are in the vehicle's display unit (km or mi). */
export function intervalKmForStorage(intervalAmount, unit) {
    const u = normalizeOdometerUnit(unit);
    return u === "mi" ? Math.round(intervalAmount * 1.609344) : intervalAmount;
}

export function findRecurrenceForService(vs, unit = "km") {
    const u = normalizeOdometerUnit(unit);
    return RECURRENCE_OPTIONS.find((o) => {
        if (o.days && o.days === vs.intervalDays) return true;
        if (!vs.intervalKm && !vs.intervalDays && o.value === "once") return true;
        if (!o.km || !vs.intervalKm) return false;
        if (u === "mi") {
            const expected = Math.round(o.km * 1.609344);
            return Math.abs(expected - vs.intervalKm) <= 2;
        }
        return o.km === vs.intervalKm;
    });
}
