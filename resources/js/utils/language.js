import { useState, useEffect } from "react";

export function useLanguage() {
    const [lang, setLangState] = useState(() => {
        return localStorage.getItem("qamra_lang") || "ar";
    });

    const setLang = (newLang) => {
        localStorage.setItem("qamra_lang", newLang);
        setLangState(newLang);
        // Apply direction to the document immediately
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLang;
    };

    useEffect(() => {
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;
    }, []);

    const t = (ar, en) => lang === "ar" ? ar : en;

    return { lang, setLang, isAr: lang === "ar", t };
}
