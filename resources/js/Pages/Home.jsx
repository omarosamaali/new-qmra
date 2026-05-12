import { useState, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import jsQR from "jsqr";
import { useLanguage } from "../utils/language";
import { brandsData } from "../Components/BrandsData";
// import { Fav } from "../../../public/images/fav";
// ─── Menu Drawer ──────────────────────────────────────────────────────────────

const menuItems = [
    { icon: "📝", ar: "المفكرة",           en: "Notes",           route: "/notes" },
    { icon: "📋", ar: "السجلات",          en: "Records",         route: "/records" },
    { icon: "💳", ar: "الاشتراكات",       en: "Subscriptions",   route: "/subscriptions" },
    { icon: "💬", ar: "تواصل معنا",       en: "Contact Us",      route: "/contact" },
    { icon: "ℹ️",  ar: "اعرفنا",           en: "About",           route: "/about" },
    { icon: "📄", ar: "الشروط والسياسة", en: "Terms & Privacy", route: "/terms" },
    { icon: "👤", ar: "حسابي",            en: "My Account",      route: "/profile" },
];

const MenuDrawer = ({ onClose, lang, setLang }) => {
    const isAr = lang === "ar";
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 z-50 flex ${isAr ? "justify-end" : "justify-start"}`} style={{ direction: "ltr" }}>
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
                onClick={handleClose}
            />
            <div
                dir={isAr ? "rtl" : "ltr"}
                className={`relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
                    visible ? "translate-x-0" : isAr ? "translate-x-full" : "-translate-x-full"
                }`}
            >

                {/* Header - covers top safe area */}
                <div className="px-5 pb-5 bg-black" style={{ paddingTop: "calc(env(safe-area-inset-top) + 2rem)" }}>
                    <img src="/images/light-logo.png" alt="قمرة" className="h-12 object-contain mb-3" />
                    <p className="text-white/80 text-xs">
                        {isAr ? "صديقك لإدارة مركبتك بذكاء" : "Your smart car friend"}
                    </p>
                </div>

                {/* Language toggle */}
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">
                        {isAr ? "اللغة" : "Language"}
                    </p>
                    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setLang("ar")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                isAr
                                    ? "bg-[#800000] text-white shadow-sm"
                                    : "text-gray-500 active:bg-white/60"
                            }`}
                        >
                            <span>العربية</span>
                        </button>
                        <button
                            onClick={() => setLang("en")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                !isAr
                                    ? "bg-[#800000] text-white shadow-sm"
                                    : "text-gray-500 active:bg-white/60"
                            }`}
                        >
                            <span>English</span>
                        </button>
                    </div>
                </div>

                {/* Menu items */}
                <div className="flex-1 overflow-y-auto py-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.route}
                            onClick={() => { handleClose(); setTimeout(() => router.get(item.route), 300); }}
                            className="w-full flex items-center gap-3 px-5 py-3 active:bg-gray-50 transition-colors"
                        >
                            <span className="text-xl w-7 text-center leading-none">
                                <img className="w-4" src="/images/fav.png" alt="" />
                            </span>
                            <span className="font-medium text-gray-800 text-sm">
                                {isAr ? item.ar : item.en}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer - covers bottom safe area */}
                <div className="px-5 pt-4 border-t border-gray-100" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}>
                    <button
                        onClick={() => { handleClose(); setTimeout(() => router.post("/logout"), 300); }}
                        className="w-full flex items-center gap-3 py-2 text-gray-400"
                    >
                        <span className="text-xl w-7 text-center leading-none">🚪</span>
                        <span className="font-medium text-sm">
                            {isAr ? "تسجيل الخروج" : "Sign Out"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Icons ────────────────────────────────────────────────────────────────────

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

const ChevronLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
);

const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

const LinkOnIcon  = () => <i className="fa-solid fa-link text-xs" />;
const LinkOffIcon = () => <i className="fa-solid fa-link-slash text-xs" />;

const LinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm1-4H8v2h8v-2z" />
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2S13.77 8.8 12 8.8 8.8 10.23 8.8 12s1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
);

// ─── Preset colors ────────────────────────────────────────────────────────────

const PRESET_COLORS = ["#1a1a1a","#4a4a4a","#c0c0c0","#ffffff","#800000","#cc2200","#1a3a8c","#2d5016","#d4a017","#8B4513"];

// ─── Edit Vehicle Sheet ───────────────────────────────────────────────────────

const EditVehicleSheet = ({ vehicle, onClose, onSave, t, isAr }) => {
    const initModel = vehicle.nameEn?.replace(vehicle.brand ?? "", "").trim() ?? "";
    const [brand, setBrand] = useState(vehicle.brand ?? "");
    const [model, setModel] = useState(initModel);
    const [form, setForm] = useState({
        year:               String(vehicle.year),
        plateNumber:        vehicle.plateNumber,
        km:                 String(vehicle.km),
        unit:               vehicle.unit || "km",
        registrationExpiry: vehicle.registrationExpiry || "",
        insuranceExpiry:    vehicle.insuranceExpiry    || "",
    });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };
    const handleSave  = () => {
        const bObj   = brandsData.find(b => b.en === brand);
        const mObj   = bObj?.models.find(m => m.en === model);
        const nameAr = `${bObj?.ar ?? brand} ${mObj?.ar ?? model}`.trim() || vehicle.nameAr;
        const nameEn = `${brand} ${model}`.trim() || vehicle.nameEn;
        onSave({ ...vehicle, ...form, brand, nameAr, nameEn, year: Number(form.year), km: Number(form.km) });
        handleClose();
    };

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400";

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={handleClose} />
            <div className={`relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-4 pb-10 transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}>
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <h2 className="font-bold text-gray-900 text-lg mb-4" dir={isAr ? "rtl" : "ltr"}>
                    {t("تعديل المركبة", "Edit Vehicle")}
                </h2>

                <div className="overflow-y-auto max-h-[72vh] no-scrollbar space-y-4 pb-2" dir={isAr ? "rtl" : "ltr"}>

                    {/* Brand */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("الشركة المصنّعة", "Brand")}</label>
                        <select value={brand} onChange={e => { setBrand(e.target.value); setModel(""); }} className={inputClass}>
                            <option value="">{t("اختر الشركة", "Select brand")}</option>
                            {brandsData.map(b => <option key={b.en} value={b.en}>{b.ar}</option>)}
                        </select>
                    </div>
                    {/* Model */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("الموديل", "Model")}</label>
                        <select value={model} onChange={e => setModel(e.target.value)} disabled={!brand} className={`${inputClass} disabled:opacity-50`}>
                            <option value="">{brand ? t("اختر الموديل", "Select model") : t("اختر الشركة أولاً", "Select brand first")}</option>
                            {(brandsData.find(b => b.en === brand)?.models ?? []).map(m => <option key={m.en} value={m.en}>{m.ar}</option>)}
                        </select>
                    </div>
                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("السنة", "Year")}</label>
                        <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className={inputClass} dir="ltr" />
                    </div>

                    {/* Plate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("رقم اللوحة", "Plate No.")}</label>
                        <input type="text" value={form.plateNumber} onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))} className={inputClass} dir="ltr" />
                    </div>

                    {/* Unit toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("نوع العداد", "Odometer Unit")}</label>
                        <div className="flex gap-3">
                            {[{ v: "km", ar: "كيلومتر", en: "km" }, { v: "mi", ar: "ميل", en: "mi" }].map(({ v, ar, en }) => (
                                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, unit: v }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                        form.unit === v ? "bg-[#800000] text-white border-[#800000]" : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}>
                                    <span>{ar}</span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${form.unit === v ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>{en}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KM */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {form.unit === "mi" ? t("العداد الحالي (ميل)", "Current Mileage (mi)") : t("العداد الحالي (كم)", "Current Mileage (km)")}
                        </label>
                        <div className="relative">
                            <input type="number" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} className={inputClass} dir="ltr" />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{form.unit === "mi" ? "mi" : "كم"}</span>
                        </div>
                    </div>

                    {/* Expiry dates */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("تاريخ انتهاء التسجيل", "Registration Expiry")}</label>
                        <input type="date" value={form.registrationExpiry} onChange={e => setForm(f => ({ ...f, registrationExpiry: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("تاريخ انتهاء التأمين", "Insurance Expiry")}</label>
                        <input type="date" value={form.insuranceExpiry} onChange={e => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))} className={inputClass} />
                    </div>

                    <button onClick={handleSave} className="w-full bg-[#800000] text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity">
                        {t("حفظ التعديلات", "Save Changes")}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Confirm Sheet ─────────────────────────────────────────────────────

const DeleteConfirmSheet = ({ vehicle, onClose, onConfirm, t, isAr }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const handleClose   = () => { setVisible(false); setTimeout(onClose, 300); };
    const handleConfirm = () => { setVisible(false); setTimeout(() => onConfirm(vehicle.id), 300); };

    const VIcon = vehicle.type === "suv" ? SuvIcon : CarIcon;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={handleClose} />
            <div className={`relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-4 pb-10 transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`} dir={isAr ? "rtl" : "ltr"}>
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: vehicle.color + "20" }}>
                        <VIcon color={vehicle.color} className="w-9 h-9" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg mb-1">{t("حذف المركبة", "Delete Vehicle")}</h2>
                    <p className="text-sm text-gray-500">
                        {isAr
                            ? `هل تريد حذف "${vehicle.nameAr}"؟ لن يمكن التراجع عن هذا الإجراء.`
                            : `Delete "${vehicle.nameEn}"? This action cannot be undone.`
                        }
                    </p>
                </div>
                <div className="space-y-2">
                    <button onClick={handleConfirm} className="w-full bg-red-500 text-white rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity">
                        {t("نعم، احذف المركبة", "Yes, Delete Vehicle")}
                    </button>
                    <button onClick={handleClose} className="w-full bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-sm active:opacity-90 transition-opacity">
                        {t("إلغاء", "Cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Vehicle View / Link Sheet ────────────────────────────────────────────────

const VehicleViewSheet = ({ vehicle, addonsLimit, linkedCount, onClose, onLinked, isAr, t }) => {
    const [visible, setVisible]   = useState(false);
    const [code, setCode]         = useState("");
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");
    const [success, setSuccess]   = useState(false);
    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef    = useRef(null);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const handleClose = () => {
        stopCamera();
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const stopCamera = () => {
        if (rafRef.current)    cancelAnimationFrame(rafRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setScanning(false);
    };

    const startCamera = async () => {
        setError("");
        try {
            if (navigator.permissions) {
                const perm = await navigator.permissions.query({ name: "camera" }).catch(() => null);
                if (perm && perm.state === "denied") {
                    setError("الكاميرا محظورة. افتح إعدادات التطبيق وامنح صلاحية الكاميرا.");
                    return;
                }
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setScanning(true);
            scanFrame();
        } catch (err) {
            if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                setError("الكاميرا محظورة. افتح إعدادات التطبيق وامنح صلاحية الكاميرا.");
            } else {
                setError("تعذّر الوصول إلى الكاميرا. أدخل الرمز يدوياً.");
            }
        }
    };

    const scanFrame = () => {
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result    = jsQR(imageData.data, imageData.width, imageData.height);
        if (result?.data) {
            stopCamera();
            setCode(result.data);
        } else {
            rafRef.current = requestAnimationFrame(scanFrame);
        }
    };

    const handleLink = async () => {
        if (!code.trim()) { setError("أدخل الرمز أولاً"); return; }
        if (vehicle.isLinked) return;
        if (addonsLimit > 0 && linkedCount >= addonsLimit) { setError(`وصلت للحد الأقصى (${addonsLimit} ربط)`); return; }
        setLoading(true);
        setError("");
        try {
            await axios.post(`/vehicles/${vehicle.id}/link`, { code: code.trim() });
            setSuccess(true);
            onLinked(vehicle.id, code.trim());
        } catch {
            setError("فشل الربط، تحقق من الرمز وحاول مجدداً");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async () => {
        setLoading(true);
        setError("");
        try {
            await axios.post(`/vehicles/${vehicle.id}/unlink`);
            onLinked(vehicle.id, null);
            handleClose();
        } catch {
            setError("حدث خطأ، حاول مجدداً");
        } finally {
            setLoading(false);
        }
    };

    const VIcon = vehicle.type === "suv" ? SuvIcon : CarIcon;
    const atLimit = !vehicle.isLinked && addonsLimit > 0 && linkedCount >= addonsLimit;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={handleClose} />
            <div className={`relative w-full max-w-sm bg-white rounded-t-3xl px-4 pt-4 pb-10 transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`} dir="rtl">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

                {/* Vehicle summary */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: vehicle.color + "20" }}>
                        <VIcon color={vehicle.color} className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{isAr ? vehicle.nameAr : vehicle.nameEn}</p>
                        <p className="text-xs text-gray-400">{vehicle.plateNumber} • {vehicle.year}</p>
                    </div>
                    {vehicle.isLinked && (
                        <span className="mr-auto text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">مربوط ✓</span>
                    )}
                </div>

                {success ? (
                    <div className="text-center py-6 space-y-2">
                        <div className="text-4xl">✅</div>
                        <p className="font-bold text-gray-900">تم الربط بنجاح!</p>
                        <p className="text-sm text-gray-500">المركبة مرتبطة الآن بتطبيق المركبة</p>
                        <button onClick={handleClose} className="mt-4 w-full bg-[#800000] text-white rounded-xl py-3 font-semibold text-sm">إغلاق</button>
                    </div>
                ) : vehicle.isLinked ? (
                    <div className="space-y-3">
                        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                            <p className="text-sm text-emerald-700 font-medium">هذه المركبة مرتبطة بتطبيق المركبة</p>
                            {vehicle.linkCode && <p className="text-xs text-gray-400 mt-1">الرمز: {vehicle.linkCode}</p>}
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button onClick={handleUnlink} disabled={loading}
                            className="w-full bg-red-50 text-red-500 rounded-xl py-3 font-semibold text-sm active:opacity-90 disabled:opacity-50">
                            {loading ? "جاري إلغاء الربط..." : "إلغاء الربط"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900">ربط بتطبيق المركبة</p>
                            <span className="text-xs text-gray-400">{linkedCount} / {addonsLimit}</span>
                        </div>

                        {atLimit ? (
                            <div className="bg-amber-50 rounded-2xl p-4 text-center">
                                <p className="text-sm text-amber-700 font-medium">وصلت للحد الأقصى للربط في باقتك</p>
                                <button onClick={() => { handleClose(); router.get("/subscriptions"); }}
                                    className="mt-3 text-[#800000] font-semibold text-sm">ترقية الباقة ←</button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    افتح تطبيق المركبة وامسح رمز QR أو أدخل الرمز الظاهر تحته.
                                </p>

                                {/* QR Scanner */}
                                {scanning ? (
                                    <div className="relative rounded-2xl overflow-hidden bg-black">
                                        <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
                                        <canvas ref={canvasRef} className="hidden" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-48 h-48 border-2 border-white/70 rounded-2xl" />
                                        </div>
                                        <button onClick={stopCamera}
                                            className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                                            إلغاء 
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={startCamera}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-2xl py-4 text-sm font-medium text-gray-600 active:bg-gray-100">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M3 3h6v6H3zm2 2v2h2V5zm10-2h6v6h-6zm2 2v2h2V5zM3 15h6v6H3zm2 2v2h2v-2zm10 0h2v2h-2zm2-2h2v2h-2zm0 4h2v2h-2zm-4-4h2v2h-2zm0 4h2v2h-2zm2-2h2v2h-2z"/>
                                        </svg>
                                        امسح رمز QR
                                    </button>
                                )}

                                {/* Manual code entry */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">أو أدخل الرمز يدوياً</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        placeholder="مثال: QMR-1234"
                                        dir="ltr"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-gray-400 text-center tracking-widest"
                                    />
                                </div>

                                {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                                <button onClick={handleLink} disabled={loading || !code.trim()}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                        code.trim() && !loading ? "bg-[#800000] text-white active:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}>
                                    {loading ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : <LinkIcon />}
                                    {loading ? "جاري الربط..." : "ربط المركبة"}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatKm = (km, unit = "km") => km.toLocaleString("en") + (unit === "mi" ? " mi" : " كم");

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "short" });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, onClick }) => (
    <div
        className="bg-white rounded-2xl p-3 text-center cursor-pointer active:opacity-80 transition-opacity"
        onClick={onClick}
    >
        <div className="text-2xl font-bold text-[#800000]">{value}</div>
        <div className="text-sm font-normal text-[#800000] mt-1">{label}</div>
    </div>
);

const  VehicleCard = ({ vehicle, reminders = [], isSelected, onClick, onEdit, onDelete, onView, isAr }) => {
    const vehicleReminders = reminders
        .filter((r) => r.vehicleId === vehicle.id && !r.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    const VIcon = vehicle.type === "suv" ? SuvIcon : CarIcon;

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 ${
                isSelected ? "ring-2 ring-[#800000] shadow-md" : "shadow-sm active:shadow-md"
            }`}
            dir={isAr ? "rtl" : "ltr"}
        >
            {/* Vehicle photo */}
            {vehicle.image && (
                <div className="h-32 w-full overflow-hidden">
                    <img src={vehicle.image} alt={vehicle.nameAr} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ backgroundColor: vehicle.image ? "transparent" : vehicle.color + "20" }}
                    >
                        {vehicle.image
                            ? <img src={vehicle.image} alt="" className="w-full h-full object-cover rounded-xl" />
                            : <VIcon color={vehicle.color} className="w-7 h-7" />
                        }
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-base leading-tight">
                            {isAr ? vehicle.nameAr : vehicle.nameEn}
                        </div>
                        <div className="text-xs text-gray-400">{vehicle.brand} &bull; {vehicle.year}</div>
                    </div>

                    {/* View / Edit / Delete buttons */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => onView(vehicle)}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${vehicle.isLinked ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500 active:bg-gray-100"}`}
                            title={vehicle.isLinked ? "فك الربط" : "ربط بالسيارة"}
                        >
                            {vehicle.isLinked ? <LinkOffIcon /> : <LinkOnIcon />}
                        </button>
                        <button
                            onClick={() => onEdit(vehicle)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 active:bg-gray-100 transition-colors"
                        >
                            <PencilIcon />
                        </button>
                        <button
                            onClick={() => onDelete(vehicle)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-red-400 active:bg-red-50 transition-colors"
                        >
                            <TrashIcon />
                        </button>
                        {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#800000] flex items-center justify-center ms-1">
                                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 mb-3">
                    <span className="text-sm font-bold text-[#800000]">{formatKm(vehicle.km, vehicle.unit)}</span>
                    <span className="text-sm font-semibold text-gray-600">{vehicle.plateNumber}</span>
                </div>
            </div>
        </div>
    );
};

const WarrantyChip = ({ warranty, isSelected, onClick, isAr }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 shrink-0 ${
            isSelected ? "bg-[#800000] text-white shadow-sm" : "bg-white text-gray-700 shadow-sm"
        }`}
    >
        <span className="text-base leading-none">{warranty.icon}</span>
        <span>{isAr ? warranty.titleAr : warranty.titleEn}</span>
    </button>
);

const ServiceChip = ({ service, isSelected, onClick, isAr }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 shrink-0 ${
            isSelected ? "bg-[#800000] text-white shadow-sm" : "bg-white text-gray-700 shadow-sm"
        }`}
    >
        <span className="text-base leading-none">{service.icon}</span>
        <span>{isAr ? service.nameAr : service.nameEn}</span>
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home({ vehicles = [], services = [], reminders = [], records = [], warranties = [], vehicleServicesCount = 0, vehicleServices = [], subscription = {}, notesCount = 0 }) {
    const [localVehicles, setLocalVehicles] = useState(vehicles);
    useEffect(() => { setLocalVehicles(vehicles); }, [vehicles]);

    // Request notification permission on first load
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Browser notifications for expiry alerts
    useEffect(() => {
        if (!("Notification" in window)) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const notify = (title, body) => {
            if (Notification.permission === "granted") {
                new Notification(title, { body, icon: "/images/fav.png" });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(p => {
                    if (p === "granted") new Notification(title, { body, icon: "/images/fav.png" });
                });
            }
        };
        vehicles.forEach(v => {
            const check = (dateStr, label) => {
                if (!dateStr) return;
                const exp = new Date(dateStr);
                const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                if (diff < 0)       notify(`🚨 ${label} منتهي`, `${v.nameAr} — انتهى منذ ${Math.abs(diff)} يوم`);
                else if (diff <= 7) notify(`⚠️ ${label} قريب الانتهاء`, `${v.nameAr} — ينتهي خلال ${diff} يوم`);
            };
            check(v.registrationExpiry, "تسجيل المركبة");
            check(v.insuranceExpiry,    "التأمين");
        });
    }, []);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [deletingVehicle, setDeletingVehicle] = useState(null);
    const [viewingVehicle, setViewingVehicle] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    const addonsLimit  = subscription?.addons_count ?? 0;
    const linkedCount  = localVehicles.filter(v => v.isLinked).length;
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedWarrantyId, setSelectedWarrantyId] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const { lang, setLang, isAr, t } = useLanguage();

    const handleEditSave = (updated) => {
        setLocalVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
        router.put(`/vehicles/${updated.id}`, updated, { preserveScroll: true });
    };
    const handleLinked = (vehicleId, code) => {
        setLocalVehicles(prev => prev.map(v =>
            v.id === vehicleId ? { ...v, isLinked: !!code, linkCode: code } : v
        ));
    };

    const handleDeleteConfirm = (vehicleId) => {
        setLocalVehicles(prev => prev.filter(v => v.id !== vehicleId));
        if (selectedVehicleId === vehicleId) {
            setSelectedVehicleId(null);
            setSelectedServiceId(null);
            setSelectedWarrantyId(null);
        }
        setDeletingVehicle(null);
        router.delete(`/vehicles/${vehicleId}`, {}, { preserveScroll: true });
    };

    const vehicleServiceIds = selectedVehicleId
        ? vehicleServices.filter((vs) => vs.vehicleId === selectedVehicleId).map((vs) => vs.serviceId)
        : vehicleServices.map((vs) => vs.serviceId);

    const displayedServices = services.filter((s) => vehicleServiceIds.includes(s.id));

    const effectiveServiceId = displayedServices.find((s) => s.id === selectedServiceId)
        ? selectedServiceId
        : null;

    const activeReminders = reminders.filter((r) => !r.completed).length;

    // Expiry alerts (within 30 days or already expired)
    const expiryAlerts = localVehicles.flatMap(v => {
        const alerts = [];
        const today = new Date(); today.setHours(0,0,0,0);
        const check = (dateStr, label) => {
            if (!dateStr) return;
            const exp = new Date(dateStr);
            const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            if (diff <= 30) alerts.push({ vehicleName: isAr ? v.nameAr : v.nameEn, label, diff, dateStr });
        };
        check(v.registrationExpiry, isAr ? "تسجيل المركبة" : "Registration");
        check(v.insuranceExpiry,    isAr ? "التأمين"        : "Insurance");
        return alerts;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingReminders = reminders
        .filter((r) => !r.completed && (!r.dueDate || new Date(r.dueDate) >= today))
        .filter((r) => !selectedVehicleId || r.vehicleId === selectedVehicleId)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    const displayedWarranties = selectedVehicleId
        ? warranties.filter((w) => w.vehicleId === selectedVehicleId)
        : warranties;

    const effectiveWarrantyId = displayedWarranties.find((w) => w.id === selectedWarrantyId)
        ? selectedWarrantyId
        : null;

    const handleVehicleClick = (vehicleId) => {
        setSelectedVehicleId((prev) => (prev === vehicleId ? null : vehicleId));
        setSelectedServiceId(null);
        setSelectedWarrantyId(null);
    };

    return (
        <>
            <Head title="قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir={isAr ? "rtl" : "ltr"}>
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    {/* Header */}
                    <div className="bg-white px-4 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm safe-header" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}>
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
                        >
                            <span className="w-5 h-0.5 bg-[#800000] rounded-full" />
                            <span className="w-5 h-0.5 bg-[#800000] rounded-full" />
                            <span className="w-5 h-0.5 bg-[#800000] rounded-full" />
                        </button>
                        <img src="/images/dark-logo.png" alt="قمرة" className="h-9 object-contain" />
                        <button
                            onClick={() => router.get("/add-vehicle")}
                            className="relative w-10 h-10 flex items-center justify-center active:opacity-80 transition-opacity"
                        >
                            <CarIcon color="#800000" className="w-8 h-8" />
                            <span className="absolute top-0 left-0 w-4 h-4 bg-[#800000] rounded-full flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 space-y-5" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom) + 1.5rem), 2.5rem)" }}>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <StatCard label={t("المفكرة", "Notes")} value={notesCount} onClick={() => router.get("/notes")} />
                                <StatCard label={t("الخدمات", "Services")} value={vehicleServicesCount} onClick={() => router.get("/services")} />
                                <StatCard label={t("الضمان", "Warranty")} value={warranties.length} onClick={() => router.get("/warranty")} />
                                <StatCard label={t("مركباتي", "My Vehicles")} value={localVehicles.length} onClick={() => router.get("/vehicles")} />
                            </div>

                            {/* Add button */}
                            <button
                                onClick={() => router.get("/add")}
                                className="w-full bg-black text-white rounded-2xl py-4 font-bold text-xl flex items-center justify-center gap-3 active:opacity-80 transition-opacity shadow-sm"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                                {t("إضافة", "Add")}
                            </button>

                            {/* Vehicles */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-gray-900 text-base">{t("مركباتي", "My Vehicles")}</h2>
                                    <button
                                        onClick={() => { setSelectedVehicleId(null); setSelectedServiceId(null); }}
                                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${
                                            selectedVehicleId === null ? "bg-[#800000] text-white" : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        {t("جميع المركبات", "All Vehicles")}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {localVehicles.map((vehicle) => (
                                        <VehicleCard
                                            key={vehicle.id}
                                            vehicle={vehicle}
                                            reminders={reminders}
                                            isSelected={selectedVehicleId === vehicle.id}
                                            isAr={isAr}
                                            onClick={() => handleVehicleClick(vehicle.id)}
                                            onEdit={(v) => setEditingVehicle(v)}
                                            onDelete={(v) => setDeletingVehicle(v)}
                                            onView={(v) => setViewingVehicle(v)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Services */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-gray-900 text-base">
                                        {t("الخدمات", "Services")}
                                        {selectedVehicleId && (
                                            <span className="text-sm font-normal text-gray-400 mr-2">
                                                ({localVehicles.find((v) => v.id === selectedVehicleId)?.[isAr ? "nameAr" : "nameEn"]})
                                            </span>
                                        )}
                                    </h2>
                                </div>

                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {displayedServices.map((service) => (
                                        <ServiceChip
                                            key={service.id}
                                            service={service}
                                            isAr={isAr}
                                            isSelected={effectiveServiceId === service.id}
                                            onClick={() => setSelectedServiceId((prev) => prev === service.id ? null : service.id)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Warranty */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-gray-900 text-base">
                                        {t("الضمان", "Warranty")}
                                        {selectedVehicleId && (
                                            <span className="text-sm font-normal text-gray-400 mr-2">
                                                ({localVehicles.find((v) => v.id === selectedVehicleId)?.[isAr ? "nameAr" : "nameEn"]})
                                            </span>
                                        )}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            const params = {};
                                            if (selectedVehicleId) params.vehicleId = selectedVehicleId;
                                            router.get("/warranty", params);
                                        }}
                                        className="flex items-center gap-0.5 text-xs text-[#800000] font-semibold"
                                    >
                                        {t("مشاهدة الكل", "View All")}
                                        <ChevronLeftIcon />
                                    </button>
                                </div>

                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {displayedWarranties.map((warranty) => (
                                        <WarrantyChip
                                            key={warranty.id}
                                            warranty={warranty}
                                            isAr={isAr}
                                            isSelected={effectiveWarrantyId === warranty.id}
                                            onClick={() => setSelectedWarrantyId((prev) => prev === warranty.id ? null : warranty.id)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Upcoming Reminders + Expiry Alerts */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-gray-900 text-base">
                                        {t("التنبيهات القادمة", "Upcoming Reminders")}
                                    </h2>
                                    <button
                                        onClick={() => router.get("/reminders")}
                                        className="flex items-center gap-0.5 text-xs text-[#800000] font-semibold"
                                    >
                                        {t("مشاهدة الكل", "View All")}
                                        <ChevronLeftIcon />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {/* Expiry alerts merged here */}
                                    {expiryAlerts.map((a, i) => (
                                        <div key={`exp-${i}`} className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${a.diff < 0 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}
                                            dir={isAr ? "rtl" : "ltr"}>
                                            <span className="text-xl shrink-0">{a.diff < 0 ? "🚨" : "⚠️"}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold ${a.diff < 0 ? "text-red-700" : "text-amber-700"}`}>
                                                    {a.label} — {a.vehicleName}
                                                </p>
                                                <p className={`text-xs mt-0.5 ${a.diff < 0 ? "text-red-500" : "text-amber-600"}`}>
                                                    {a.diff < 0
                                                        ? (isAr ? `منتهي منذ ${Math.abs(a.diff)} يوم` : `Expired ${Math.abs(a.diff)}d ago`)
                                                        : a.diff === 0
                                                            ? (isAr ? "ينتهي اليوم!" : "Expires today!")
                                                            : (isAr ? `ينتهي خلال ${a.diff} يوم` : `Expires in ${a.diff}d`)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 shrink-0">{a.dateStr}</p>
                                        </div>
                                    ))}

                                    {upcomingReminders.length === 0 && expiryAlerts.length === 0 && (
                                        <div className="bg-white rounded-2xl p-8 text-center">
                                            <p className="text-gray-400 text-sm">{t("لا توجد تنبيهات قادمة", "No upcoming reminders")}</p>
                                        </div>
                                    )}

                                    {upcomingReminders.map((r) => {
                                        const vehicle = localVehicles.find((v) => v.id === r.vehicleId);
                                        const service = services.find((s) => s.id === r.serviceId);
                                        const diff = r.dueDate ? Math.ceil((new Date(r.dueDate) - today) / (1000 * 60 * 60 * 24)) : null;
                                        const urgent = diff !== null && diff <= 7;
                                        return (
                                            <div
                                                key={r.id}
                                                className={`bg-white rounded-2xl px-4 py-3 shadow-sm border-r-4 flex items-center gap-3 ${urgent ? "border-amber-400" : "border-[#800000]"}`}
                                                dir={isAr ? "rtl" : "ltr"}
                                            >
                                                <span className="text-xl leading-none shrink-0">{service?.icon ?? "🔔"}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm">{r.titleAr}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {isAr ? vehicle?.nameAr : vehicle?.nameEn}
                                                    </p>
                                                </div>
                                                {diff !== null && (
                                                    <div className="text-left shrink-0">
                                                        <p className={`text-xs font-bold ${urgent ? "text-amber-600" : "text-[#800000]"}`}>
                                                            {diff === 0 ? t("اليوم", "Today") : diff === 1 ? t("غداً", "Tomorrow") : isAr ? `خلال ${diff} يوم` : `In ${diff}d`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{formatDate(r.dueDate)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>

            {menuOpen && <MenuDrawer onClose={() => setMenuOpen(false)} lang={lang} setLang={setLang} />}

            {editingVehicle && (
                <EditVehicleSheet
                    vehicle={editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                    onSave={handleEditSave}
                    t={t}
                    isAr={isAr}
                />
            )}

            {deletingVehicle && (
                <DeleteConfirmSheet
                    vehicle={deletingVehicle}
                    onClose={() => setDeletingVehicle(null)}
                    onConfirm={handleDeleteConfirm}
                    t={t}
                    isAr={isAr}
                />
            )}

            {viewingVehicle && (
                <VehicleViewSheet
                    vehicle={viewingVehicle}
                    addonsLimit={addonsLimit}
                    linkedCount={linkedCount}
                    onClose={() => setViewingVehicle(null)}
                    onLinked={handleLinked}
                    isAr={isAr}
                    t={t}
                />
            )}
        </>
    );
}
