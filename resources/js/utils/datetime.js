/**
 * Local calendar helpers — avoid `new Date('YYYY-MM-DD')` which is parsed as UTC
 * and shifts the calendar day in many timezones.
 */

export function startOfLocalToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Parse `YYYY-MM-DD` at local midnight. */
export function parseYmdLocal(ymd) {
    if (!ymd || typeof ymd !== "string") return null;
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const day = Number(m[3]);
    const d = new Date(y, mo, day, 0, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Local date + optional `HH:MM` (24h). */
export function parseYmdHmLocal(ymd, timeHm) {
    const d = parseYmdLocal(ymd);
    if (!d) return null;
    const t = timeHm && String(timeHm).length >= 5 ? String(timeHm).slice(0, 5) : "09:00";
    const [hh, mm] = t.split(":").map((x) => Number(x));
    d.setHours(Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0);
    return d;
}

/** Calendar days from local today to `ymd` (local midnight). */
export function dayDiffFromLocalToday(ymd) {
    const due = parseYmdLocal(ymd);
    if (!due) return null;
    const t0 = startOfLocalToday();
    return Math.round((due.getTime() - t0.getTime()) / (1000 * 60 * 60 * 24));
}
