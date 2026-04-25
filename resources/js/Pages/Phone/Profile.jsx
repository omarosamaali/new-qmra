import { useState } from "react";
import { Head, router } from "@inertiajs/react";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

const T = {
    ar: {
        pageTitle: "حسابي - قمرة",
        header: "حسابي",
        account: "بيانات الحساب",
        name: "الاسم",
        email: "البريد الإلكتروني",
        phone: "رقم الجوال",
        editProfile: "تعديل البيانات",
        saveChanges: "حفظ التعديلات",
        cancel: "إلغاء",
        dangerZone: "منطقة الخطر",
        deleteTitle: "حذف الحساب",
        deleteDesc: "سيتم حذف جميع بياناتك ومركباتك وسجلاتك نهائياً ولا يمكن التراجع.",
        deleteBtn: "حذف الحساب",
        confirmTitle: "تأكيد حذف الحساب",
        confirmDesc: "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع بياناتك بشكل دائم.",
        typeConfirm: 'اكتب "احذف حسابي" للتأكيد',
        placeholder: "احذف حسابي",
        confirmKeyword: "احذف حسابي",
        confirmDelete: "حذف نهائي",
        logout: "تسجيل الخروج",
        signedAs: "مسجّل دخول بـ",
        saving: "جاري الحفظ...",
    },
    en: {
        pageTitle: "My Account - Qumra",
        header: "My Account",
        account: "Account Details",
        name: "Name",
        email: "Email",
        phone: "Phone Number",
        editProfile: "Edit Profile",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        dangerZone: "Danger Zone",
        deleteTitle: "Delete Account",
        deleteDesc: "All your data, vehicles, and records will be permanently deleted and cannot be recovered.",
        deleteBtn: "Delete Account",
        confirmTitle: "Confirm Account Deletion",
        confirmDesc: "This action cannot be undone. Your account and all data will be permanently deleted.",
        typeConfirm: 'Type "delete my account" to confirm',
        placeholder: "delete my account",
        confirmKeyword: "delete my account",
        confirmDelete: "Delete Permanently",
        logout: "Sign Out",
        signedAs: "Signed in as",
        saving: "Saving...",
    },
};

export default function Profile({ user }) {
    const [lang, setLang] = useState("ar");
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [typed, setTyped] = useState("");
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
    });

    const t = T[lang];
    const isAr = lang === "ar";
    const canDelete = typed.trim() === t.confirmKeyword;

    // تسجيل الخروج
    const handleLogout = () => {
        router.post('/logout');
    };

    // بدء وضع التعديل
    const handleEditProfile = () => {
        setIsEditing(true);
        setFormData({
            name: user.name || "",
            email: user.email || "",
        });
    };

    // حفظ التعديلات
    const handleSaveProfile = () => {
        setProcessing(true);

        router.put('/profile', formData, {
            onSuccess: () => {
                setIsEditing(false);
            },
            onError: (errors) => {
                console.error(errors);
                // يمكنك إضافة رسائل خطأ للمستخدم هنا لاحقاً
            },
            onFinish: () => setProcessing(false),
        });
    };

    // إلغاء التعديل
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // حذف الحساب
    const handleDelete = () => {
        if (!canDelete) return;

        router.delete('/profile', {
            onBefore: () => setProcessing(true),
            onSuccess: () => { },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title={t.pageTitle} />
            <div
                className="min-h-screen bg-gray-100 flex justify-center"
                dir={isAr ? "rtl" : "ltr"}
            >
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">
                    {/* Header */}
                    <div className="bg-white flex items-center justify-between sticky top-0 z-20 shadow-sm safe-header">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.get("/")}
                                className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                            >
                                <BackIcon />
                            </button>
                            <h1 className="font-bold text-gray-900 text-lg">
                                {t.header}
                            </h1>
                        </div>
                        <button
                            onClick={() => setLang(isAr ? "en" : "ar")}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#800000] text-[#800000] ml-4 mr-4"
                        >
                            {isAr ? "English" : "عربي"}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-6 pb-10 space-y-4">
                            {/* Avatar + name */}
                            <div className="bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-[#800000] flex items-center justify-center text-white text-2xl font-bold mb-3">
                                    {user.name.charAt(0)}
                                </div>
                                <p className="font-bold text-gray-900 text-lg">
                                    {isEditing ? formData.name : user.name}
                                </p>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {t.signedAs} {user.email}
                                </p>
                            </div>

                            {/* Account details - Edit Mode */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm">
                                <p className="font-bold text-gray-900 mb-5">
                                    {t.account}
                                </p>

                                <div className="space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1.5">
                                            {t.name}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]"
                                                dir={isAr ? "rtl" : "ltr"}
                                            />
                                        ) : (
                                            <p className="text-gray-800 font-medium">{user.name}</p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1.5">
                                            {t.email}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]"
                                            />
                                        ) : (
                                            <p className="text-gray-800 font-medium">{user.email}</p>
                                        )}
                                    </div>

                                </div>

                                {/* Action Buttons */}
                                {isEditing ? (
                                    <div className="flex gap-3 mt-8">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 py-3.5 rounded-2xl border border-gray-300 text-gray-700 font-medium active:opacity-80"
                                        >
                                            {t.cancel}
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={processing}
                                            className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all ${processing
                                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                                    : "bg-[#800000] text-white active:opacity-80"
                                                }`}
                                        >
                                            {processing ? t.saving : t.saveChanges}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEditProfile}
                                        className="mt-6 w-full py-3.5 rounded-2xl border border-[#800000] text-[#800000] text-sm font-semibold active:opacity-80 transition-opacity"
                                    >
                                        {t.editProfile}
                                    </button>
                                )}
                            </div>

                            {/* Sign out button */}
                            <button
                                onClick={handleLogout}
                                className="w-full bg-white rounded-3xl p-4 shadow-sm flex items-center gap-3 active:opacity-80 transition-opacity"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
                                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">{t.logout}</span>
                            </button>

                            {/* Danger zone */}
                            <div className="bg-white rounded-3xl p-4 shadow-sm border border-red-100">
                                <p className="font-bold text-red-600 px-2 pb-3 flex items-center gap-2">
                                    <span>⚠️</span> {t.dangerZone}
                                </p>
                                <div className="px-2">
                                    <p className="font-semibold text-gray-800 text-sm mb-1">{t.deleteTitle}</p>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{t.deleteDesc}</p>
                                    <button
                                        onClick={() => {
                                            setShowConfirm(true);
                                            setTyped("");
                                        }}
                                        className="w-full py-3 rounded-2xl bg-red-600 text-white text-sm font-bold active:opacity-80 transition-opacity"
                                    >
                                        {t.deleteBtn}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
                    <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10 space-y-4 animate-[slideUp_.25s_ease]">
                        <div className="text-center">
                            <p className="font-bold text-gray-900 text-base">{t.confirmTitle}</p>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{t.confirmDesc}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-2">{t.typeConfirm}</p>
                            <input
                                type="text"
                                value={typed}
                                onChange={(e) => setTyped(e.target.value)}
                                placeholder={t.placeholder}
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                dir={isAr ? "rtl" : "ltr"}
                            />
                        </div>
                        <button
                            onClick={handleDelete}
                            disabled={!canDelete || processing}
                            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${canDelete && !processing
                                    ? "bg-red-600 text-white active:opacity-80"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                }`}
                        >
                            {processing ? (isAr ? "جارٍ الحذف..." : "Deleting...") : t.confirmDelete}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600"
                        >
                            {t.cancel}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}