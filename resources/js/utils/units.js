/** Normalize odometer unit from API / DB (mi, mil, miles, etc.) to `mi` or `km`. */
export function normalizeOdometerUnit(u) {
    if (u == null || u === "") return "km";
    const x = String(u).trim().toLowerCase();
    if (x === "mi" || x === "mil" || x === "mile" || x === "miles") return "mi";
    return "km";
}

/** Display suffix for lists and inputs (Arabic vs English UI). */
export function odometerSuffix(unit, isAr) {
    const u = normalizeOdometerUnit(unit);
    if (u === "mi") return isAr ? "ميل" : "mi";
    return isAr ? "كم" : "km";
}
