import { useState, useEffect, useRef, useCallback } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { T, SURAH_NAMES, CHANNELS, SRow, BtnG, to12h, AnalogClock } from "../../Components/T";

const SK = { pin: "car_pin", theme: "car_theme", lang: "car_lang", notif: "car_notif", brt: "car_brt" };
const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const load = (k, d) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

export default function CarDashboard({ userName }) {
    // ── Theme: auto based on time if not saved ────────────────────────────────
    const [theme, setThemeR] = useState(() => {
        const saved = load(SK.theme, null);
        if (saved) return saved;
        const h = new Date().getHours();
        return (h >= 18 || h < 6) ? "dark" : "light";
    });
    const [lang, setLangR]     = useState(() => load(SK.lang, "ar"));
    const [brt, setBrtR]       = useState(() => load(SK.brt, 80));
    const [notifOn, setNotifR] = useState(() => load(SK.notif, true));
    const [prayerOn, setPrayerOnR] = useState(() => load("car_prayer_on", true));
    const [doaaOn, setDoaaOnR]    = useState(() => load("car_doaa_enabled", true));
    const [savedPin, setSavedPinR] = useState(() => load(SK.pin, null));

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [snoozeMenu, setSnoozeMenu]     = useState(null); // { id, title, type, icon, sub }
    const [centerView, setCenterView]     = useState(null); // null | "notes" | "reminders" | "audio" | "quran"
    const [reminderTab, setReminderTab]   = useState("upcoming");
    const [allReminders, setAllReminders] = useState([]);
    const [audioSubScreen, setAudioSubScreen] = useState(null);

    const [notesList, setNotesList] = useState(() => load("car_notes", []));
    const [noteForm, setNoteForm]   = useState({ title: "", body: "", date: "", time: "" });

    const saveNote = () => {
        if (!noteForm.title.trim() && !noteForm.body.trim()) return;
        const updated = [{ id: Date.now(), ...noteForm, createdDate: new Date().toLocaleDateString("ar-EG") }, ...notesList];
        setNotesList(updated); save("car_notes", updated);
        setNoteForm({ title: "", body: "", date: "", time: "" });
    };
    const delNote = id => { const u = notesList.filter(n => n.id !== id); setNotesList(u); save("car_notes", u); };

    const [pinMode, setPinMode]       = useState("idle");
    const [pinInput, setPinInput]     = useState([]);
    const [pinConf, setPinConf]       = useState([]);
    const [pinStep, setPinStep]       = useState("first");
    const [pinErr, setPinErr]         = useState("");
    const [pinAttempts, setPinAttempts] = useState(3);
    const [unlocked, setUnlocked]     = useState(() => !load(SK.pin, null));
    const [shakePin, setShakePin]     = useState(false);

    const [prayers, setPrayers]       = useState({});
    const [nextPrayer, setNextPrayer] = useState(null);
    const [now, setNow]               = useState(new Date());
    const [toasts, setToasts]         = useState([]);
    const [isLandscape, setIsLandscape] = useState(() => {
        const saved = localStorage.getItem("car_layout");
        if (saved === "landscape") return true;
        if (saved === "portrait")  return false;
        return window.innerWidth > window.innerHeight;
    });

    const [vehicleData, setVehicleData]   = useState(null);
    const [nextReminder, setNextReminder] = useState(null);
    const [noLink, setNoLink]             = useState(false);

    const [aiState, setAiState]     = useState("idle");
    const [aiText, setAiText]       = useState("");
    const [aiCaption, setAiCaption] = useState("");
    const mediaRecRef  = useRef(null);
    const audioChunks  = useRef([]);
    const synthUtter   = useRef(null);
    const audioRef      = useRef(null);
    const notifAudioRef = useRef(null);
    const doaaRef       = useRef(null);
    const lastSaveRef   = useRef(0);
    const [nowPlaying, setNowPlaying]     = useState(null);
    const [isPlaying, setIsPlaying]       = useState(false);
    const [audioError, setAudioError]     = useState(false);
    const [audioCurrent, setAudioCurrent] = useState(0);
    const [audioDur, setAudioDur]         = useState(0);
    const [bookProgress, setBookProgress] = useState(() => load("car_book_progress", {}));
    const [aiAssistant, setAiAssistantR]  = useState(() => load("car_assistant", "hamda"));

    const fmtTime = (s) => {
        if (!s || isNaN(s) || !isFinite(s)) return "0:00";
        const m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return `${m}:${String(sec).padStart(2, "0")}`;
    };

    const saveBookPos = (url, ct, dur) => {
        if (!url || ct < 3) return;
        const updated = { ...bookProgress, [url]: { currentTime: ct, duration: dur } };
        setBookProgress(updated);
        save("car_book_progress", updated);
    };

    const clearBookPos = (url) => {
        const updated = { ...bookProgress };
        delete updated[url];
        setBookProgress(updated);
        save("car_book_progress", updated);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current || !nowPlaying?.cover) return;
        const ct  = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 0;
        setAudioCurrent(ct);
        setAudioDur(dur);
        const now = Date.now();
        if (now - lastSaveRef.current > 4000) {
            lastSaveRef.current = now;
            saveBookPos(nowPlaying.url, ct, dur);
        }
    };

    const t        = T[lang];
    const isDark   = theme === "dark";
    const isAr     = lang === "ar";

    const setTheme      = v => { setThemeR(v); save(SK.theme, v); };
    const setLang       = v => { setLangR(v); save(SK.lang, v); };
    const setBrt        = v => { setBrtR(v); save(SK.brt, v); };
    const setNotif      = v => { setNotifR(v); save(SK.notif, v); };
    const setPrayerOn   = v => { setPrayerOnR(v); save("car_prayer_on", v); };
    const setDoaaOn     = v => { setDoaaOnR(v); save("car_doaa_enabled", v); };
    const setSavedPin   = v => { setSavedPinR(v); save(SK.pin, v); };
    const setAiAssistant = v => { setAiAssistantR(v); save("car_assistant", v); };

    const playNotif = (num) => {
        if (!notifAudioRef.current || !notifOn) return;
        const folder  = aiAssistant === "sakr" ? "Hamad" : "shikah";
        const langDir = isAr ? "ar" : "en";
        notifAudioRef.current.src = `/sounds/qmra-sound/${folder}/${langDir}/${num}.mp3`;
        notifAudioRef.current.load();
        notifAudioRef.current.play().catch(() => {});
    };

    const handleBack = () => {
        if (audioSubScreen) { setAudioSubScreen(null); return; }
        if (centerView) { setCenterView(null); return; }
    };

    // ── Upcoming notes (future date) ──────────────────────────────────────────
    const upcomingNotes = notesList.filter(n => {
        if (!n.date) return false;
        const d = new Date(n.date + (n.time ? `T${n.time}` : ""));
        return d >= new Date();
    }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);

    // ── Audio helpers ─────────────────────────────────────────────────────────
    const playChannel = (ch) => {
        if (!audioRef.current) return;
        setAudioError(false);
        setAudioCurrent(0); setAudioDur(0);
        audioRef.current.pause();
        audioRef.current.src = ch.url;
        audioRef.current.load();
        if (ch.cover) {
            const saved = bookProgress[ch.url];
            if (saved?.currentTime > 3) {
                const onMeta = () => { audioRef.current.currentTime = saved.currentTime; };
                audioRef.current.addEventListener("loadedmetadata", onMeta, { once: true });
            }
        }
        audioRef.current.play().catch(() => { setAudioError(true); setIsPlaying(false); });
        setNowPlaying(ch);
        setIsPlaying(true);
        setCenterView("audio");
    };
    const togglePlay = () => {
        if (!audioRef.current || !nowPlaying) return;
        if (isPlaying) {
            if (nowPlaying.cover) saveBookPos(nowPlaying.url, audioRef.current.currentTime, audioRef.current.duration);
            audioRef.current.pause(); setIsPlaying(false);
        } else {
            setAudioError(false); audioRef.current.play().catch(() => setAudioError(true)); setIsPlaying(true);
        }
    };
    const stopAudio = () => {
        if (audioRef.current) {
            if (nowPlaying?.cover) saveBookPos(nowPlaying.url, audioRef.current.currentTime, audioRef.current.duration);
            audioRef.current.pause(); audioRef.current.src = "";
        }
        setIsPlaying(false); setNowPlaying(null); setAudioError(false); setAudioCurrent(0); setAudioDur(0);
    };

    // ── CSS injection ─────────────────────────────────────────────────────────
    useEffect(() => {
        const el = document.createElement("style");
        el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
      *{box-sizing:border-box;margin:0;padding:0;font-family:'Cairo',sans-serif}
      input[type=range]{accent-color:#b91c1c}
      .glass{border-radius:15px}
      .tgl{width:44px;height:24px;border-radius:9999px;position:relative;cursor:pointer;transition:background .3s}
      .tgl .knob{position:absolute;top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:left .3s}
      .tgl.on{background:#b91c1c}.tgl.on .knob{left:22px}
      .tgl.off{background:rgba(255,255,255,.2)}.tgl.off .knob{left:2px}
      @keyframes sIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes fOut{from{opacity:1}to{opacity:0}}
      .toast{animation:sIn .3s ease}.toast.die{animation:fOut .4s ease forwards}
      @keyframes shk{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
      .shk{animation:shk .4s ease}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    `;
        document.head.appendChild(el);
        return () => document.head.removeChild(el);
    }, []);

    useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

    // Auto dark/light theme: dark from 6 PM → 6 AM
    useEffect(() => {
        const h = now.getHours();
        const shouldBeDark = h >= 18 || h < 6;
        setThemeR(shouldBeDark ? "dark" : "light");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [now.getHours()]);

    useEffect(() => {
        const fn = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener("resize", fn);
        window.addEventListener("orientationchange", fn);
        return () => { window.removeEventListener("resize", fn); window.removeEventListener("orientationchange", fn); };
    }, []);

    useEffect(() => {
        const linkCode = localStorage.getItem("car_link_code");
        if (!linkCode) {
            ["car_lang","car_assistant","car_layout"].forEach(k => localStorage.removeItem(k));
            window.location.href = "/car";
            return;
        }

        const fetchAll = () => {
            axios.get(`/api/car/vehicle/${linkCode}`)
                .then(r => setVehicleData(r.data)).catch(() => setNoLink(true));
            axios.get(`/api/car/reminders/${linkCode}`)
                .then(r => setNextReminder(r.data?.[0] ?? null)).catch(() => {});
            axios.get(`/api/car/reminders/${linkCode}/all`)
                .then(r => setAllReminders(r.data || [])).catch(() => {});
        };

        fetchAll();
        // refresh km every 2 minutes to catch km-based reminders while driving
        const poll = setInterval(fetchAll, 120_000);
        return () => clearInterval(poll);
    }, []);

    useEffect(() => {
        fetch("https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5")
            .then(r => r.json()).then(d => {
                if (d.code === 200) {
                    const p = {}; PRAYERS.forEach(n => { if (d.data.timings[n]) p[n] = d.data.timings[n]; });
                    setPrayers(p);
                }
            }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!Object.keys(prayers).length) return;
        const pad = n => String(n).padStart(2, "0");
        const cur = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        let found = null;
        for (const n of PRAYERS) { if (prayers[n] && prayers[n] > cur) { found = { name: n, time: prayers[n] }; break; } }
        if (!found) found = { name: PRAYERS[0], time: prayers[PRAYERS[0]] };
        setNextPrayer(found);
    }, [prayers, now]);

    const addToast = useCallback((title, type = "info", icon = null, sub = null) => {
        if (!notifOn) return;
        const id = Date.now();
        setToasts(p => [...p, { id, title, type, icon, sub, die: false }]);
        setTimeout(() => setToasts(p => p.map(x => x.id === id ? { ...x, die: true } : x)), 4500);
        setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 5000);
    }, [notifOn]);

    const stopSpeaking = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setAiState("idle"); };

    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = isAr ? "ar-EG" : "en-US";
        utter.rate = 1.0; utter.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => isAr ? v.lang.startsWith("ar") : v.lang.startsWith("en"));
        if (preferred) utter.voice = preferred;
        utter.onstart = () => setAiState("speaking");
        utter.onend = () => setAiState("idle");
        utter.onerror = () => setAiState("idle");
        synthUtter.current = utter;
        setAiState("speaking");
        window.speechSynthesis.speak(utter);
    };

    const askClaude = async (userText) => {
        setAiState("thinking"); setAiText("");
        const isSakr = aiAssistant === "sakr";
        const systemPrompt = isAr
            ? (isSakr ? "أنت مساعد سيارة ذكي اسمك 'صقر'. شخصيتك جادة وواثقة. أجب بإجابات قصيرة وودية بالعربية. لا تزيد عن جملتين."
                      : "أنتِ مساعدة سيارة ذكية اسمك 'حمدة'. شخصيتك ودودة ولطيفة. أجيبي بإجابات قصيرة وودية بالعربية. لا تزيدي عن جملتين.")
            : (isSakr ? "You are a smart car assistant named 'Saqr'. Confident male personality. Short friendly replies in English. Max 2 sentences."
                      : "You are a smart car assistant named 'Hamda'. Warm female personality. Short friendly replies in English. Max 2 sentences.");
        try {
            const res = await fetch("#", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, system: systemPrompt, messages: [{ role: "user", content: userText }] })
            });
            const data = await res.json();
            const reply = data.content?.find(c => c.type === "text")?.text || (isAr ? "عذراً، لم أفهم." : "Sorry, I didn't understand.");
            setAiText(reply); speakText(reply);
        } catch {
            const err = isAr ? "حدث خطأ في الاتصال." : "Connection error.";
            setAiText(err); speakText(err);
        }
    };

    const startListening = () => {
        if (aiState !== "idle") { stopSpeaking(); return; }
        setAiCaption(""); setAiText("");
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SR();
            rec.lang = isAr ? "ar-EG" : "en-US";
            rec.interimResults = false; rec.maxAlternatives = 1;
            setAiState("listening");
            rec.onresult = e => { const tr = e.results[0][0].transcript; setAiCaption(tr); askClaude(tr); };
            rec.onerror = () => { setAiState("idle"); addToast(isAr ? "تعذّر الوصول للميكروفون" : "Microphone access denied", "info", "🎤"); };
            rec.onend = () => { if (aiState === "listening") setAiState("idle"); };
            rec.start();
        } else {
            addToast(isAr ? "المتصفح لا يدعم التعرف على الصوت" : "Speech recognition not supported", "info", "🎤");
        }
    };

    // Startup greeting (sound 1)
    const greetedRef = useRef(false);
    useEffect(() => {
        if (greetedRef.current) return;
        greetedRef.current = true;
        const t = setTimeout(() => playNotif(1), 2000);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // دعاء الركوب — play once per 24 h on app start
    const doaaPlayedRef = useRef(false);
    useEffect(() => {
        if (doaaPlayedRef.current) return;
        doaaPlayedRef.current = true;
        const enabled = load("car_doaa_enabled", true);
        if (!enabled) return;
        const last = Number(localStorage.getItem("car_doaa_last_played") || 0);
        if (Date.now() - last < 86400000) return;
        const timer = setTimeout(() => {
            if (!doaaRef.current) return;
            doaaRef.current.src = "/sounds/qmra-sound/doaa_rokob.mp3";
            doaaRef.current.load();
            doaaRef.current.play().catch(() => {});
            localStorage.setItem("car_doaa_last_played", String(Date.now()));
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const PRAYER_SOUNDS = { Fajr: 12, Dhuhr: 13, Asr: 14, Maghrib: 15, Isha: 16 };
    const notifiedP = useRef(new Set());
    useEffect(() => {
        if (!nextPrayer || !notifOn || !prayerOn) return;
        const pad = n => String(n).padStart(2, "0");
        const cur = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const key = `${nextPrayer.name}-${cur}`;
        if (cur === nextPrayer.time && !notifiedP.current.has(key)) {
            notifiedP.current.add(key);
            addToast(t.prayerNames[nextPrayer.name], "prayer", "🕌", `${t.prayerTime} • ${to12h(nextPrayer.time, isAr)}`);
            const snd = PRAYER_SOUNDS[nextPrayer.name];
            if (snd) playNotif(snd);
        }
    }, [now, nextPrayer, notifOn, prayerOn, t, addToast]);

    // Time-based reminder alerts (sound 11)
    const notifiedTime = useRef(new Set());
    useEffect(() => {
        if (!allReminders.length || !notifOn) return;
        const pad = n => String(n).padStart(2, "0");
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const curTime  = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        allReminders.forEach(r => {
            if (r.completed || !r.dueTime) return;
            // fire when time matches and either no date set or date is today
            const dateMatch = !r.dueDate || r.dueDate === todayStr;
            const key = `${r.id}-${curTime}`;
            if (dateMatch && r.dueTime === curTime && !notifiedTime.current.has(key)) {
                notifiedTime.current.add(key);
                addToast(r.titleAr, "reminder", "🔔", r.notes || (isAr ? "حان وقت التذكير" : "Reminder due"));
                playNotif(11);
            }
        });
    }, [now, allReminders, notifOn]);

    // KM-based reminder alerts (sound 11)
    const notifiedKm = useRef(new Set());
    useEffect(() => {
        if (!vehicleData || !allReminders.length || !notifOn) return;
        const currentKm = Number(vehicleData.km);
        allReminders.forEach(r => {
            if (!r.dueKm || r.completed) return;
            if (currentKm >= Number(r.dueKm) && !notifiedKm.current.has(r.id)) {
                notifiedKm.current.add(r.id);
                addToast(r.titleAr, "reminder", "🔧", isAr ? "حان وقت الصيانة" : "Maintenance due");
                playNotif(11);
            }
        });
    }, [vehicleData, allReminders, notifOn]);

    // Expiry alerts (registration=38, insurance=39)
    const notifiedExp = useRef(new Set());
    useEffect(() => {
        if (!vehicleData || !notifOn) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const check = (dateStr, soundNum, labelAr, labelEn) => {
            if (!dateStr) return;
            const exp  = new Date(dateStr);
            const diff = Math.ceil((exp - today) / 86400000);
            if (diff <= 30 && diff >= 0 && !notifiedExp.current.has(dateStr)) {
                notifiedExp.current.add(dateStr);
                const label = isAr ? labelAr : labelEn;
                addToast(label, "reminder", "⚠️", diff === 0 ? (isAr ? "ينتهي اليوم!" : "Expires today!") : (isAr ? `ينتهي خلال ${diff} يوم` : `Expires in ${diff} days`));
                playNotif(soundNum);
            }
        };
        check(vehicleData.registrationExpiry, 38, "انتهاء تسجيل المركبة", "Registration expiry");
        check(vehicleData.insuranceExpiry,    39, "انتهاء التأمين",        "Insurance expiry");
    }, [vehicleData, notifOn, isAr]);

    const shake = () => { setShakePin(true); setTimeout(() => setShakePin(false), 500); };

    const pinPress = n => {
        if (pinMode === "set") {
            if (pinStep === "first") {
                const nx = [...pinInput, n]; setPinInput(nx);
                if (nx.length === 4) { setPinConf(nx); setPinStep("second"); setPinInput([]); setPinErr(""); }
            } else {
                const nx = [...pinInput, n]; setPinInput(nx);
                if (nx.length === 4) {
                    if (pinConf.join("") === nx.join("")) { setSavedPin(nx.join("")); setPinMode("idle"); setPinInput([]); setPinConf([]); setPinStep("first"); setPinErr(""); addToast(t.pinSet, "success", "✅"); }
                    else { shake(); setPinErr(t.pinMismatch); setPinInput([]); setPinStep("first"); setPinConf([]); }
                }
            }
        } else if (pinMode === "unlock") {
            const nx = [...pinInput, n]; setPinInput(nx);
            if (nx.length === 4) {
                if (nx.join("") === savedPin) { setUnlocked(true); setPinMode("idle"); setPinInput([]); setPinAttempts(3); setPinErr(""); }
                else { shake(); const l = pinAttempts - 1; setPinAttempts(l); setPinErr(`${t.pinWrong} ${l}`); setPinInput([]); }
            }
        }
    };
    const pinDel    = () => setPinInput(p => p.slice(0, -1));
    const openSetPin = () => { setPinMode("set"); setPinStep("first"); setPinInput([]); setPinConf([]); setPinErr(""); };
    const closePin  = () => { if (pinMode !== "unlock") { setPinMode("idle"); setPinInput([]); setPinStep("first"); setPinErr(""); } };
    const deletePin = () => { setSavedPin(null); addToast(t.pinDeleted, "info", "🗑️"); };

    const pad  = n => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // ── Colours ───────────────────────────────────────────────────────────────
    const bg      = isDark ? "linear-gradient(to top,#0d0d0d 10%,#1a0a0a 55%,#2a1010 100%)" : "linear-gradient(to top,#f5e8e8 0%,#ede0e0 100%)";
    const cardBg  = isDark ? "linear-gradient(135deg,#2a1010,#1a0808)" : "linear-gradient(135deg,#ffffff,#fdf0f0)";
    const centerBg = isDark ? "#000" : "#e7e7e7";
    const tp      = isDark ? "#ffffff" : "#1a0000";
    const ts      = isDark ? "#c9a0a0" : "#5a2020";
    const tm      = isDark ? "rgba(255,180,180,0.4)" : "rgba(100,0,0,0.35)";
    const sBg     = isDark ? "linear-gradient(135deg,#1a0808,#120404)" : "linear-gradient(135deg,#fdf0f0,#fce8e8)";
    const rowBg   = isDark ? "rgba(128,0,0,0.18)" : "rgba(255,255,255,0.85)";
    const ppBg    = isDark ? "#1a0808" : "#fdf0f0";
    const pbBg    = isDark ? "rgba(128,0,0,0.2)" : "rgba(128,0,0,0.08)";

    const pinModalOpen = pinMode === "set" || pinMode === "unlock";
    const dotsCount = pinMode === "set" && pinStep === "second" ? pinConf.length : pinInput.length;
    const pinLabel  = pinMode === "unlock" ? t.pinLocked : pinStep === "first" ? t.enterPin : t.confirmPin;
    const toastColors = { prayer: "#7c3aed", reminder: "#b91c1c", success: "#059669", info: "#1d4ed8" };

    // ── No-link screen ────────────────────────────────────────────────────────
    if (noLink) return (
        <div dir={isAr ? "rtl" : "ltr"} style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#0f0f0f", color: "#fff", fontFamily: "'Cairo',sans-serif" }}>
            <Head title="Dashboard" />
            <img src="/images/main-logo.png" alt="قمرة" style={{ height: "60px", objectFit: "contain" }} />
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>{t.noLinkTitle}</p>
            <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", maxWidth: "280px" }}>{t.noLinkDesc}</p>
            <button onClick={() => { localStorage.removeItem("car_link_code"); window.location.href = "/car"; }}
                style={{ marginTop: "8px", background: "#800000", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 28px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
                {t.noLinkBtn}
            </button>
        </div>
    );

    // ── Apps for side grid ─────────────────────────────────────────────────────
    const sideApps = [
        { icon: "fa-sticky-note", label: t.notes,      bg: "#800000",  onClick: () => setCenterView("notes") },
        { icon: "fa-bell",        label: t.reminders,  bg: "#1a1a1a",  onClick: () => setCenterView("reminders") },
        // { icon: "fa-quran",       label: t.quran,      bg: "#065f46",  onClick: () => setCenterView("quran") },
        { icon: "fa-music",       label: t.audio,      bg: "#800000",  onClick: () => setCenterView("audio") },
        { icon: "fa-language",    label: t.toggleLang, bg: "#1a1a1a",  onClick: () => setLang(isAr ? "en" : "ar") },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div dir={isAr ? "rtl" : "ltr"} style={{ display: "flex", flexDirection: "column", height: "100dvh", background: bg, fontFamily: "'Cairo',sans-serif", color: tp, overflow: "hidden", filter: `brightness(${brt / 100 * 0.5 + 0.5})`, paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}>
            <Head title="Dashboard" />

            {/* Lock Screen */}
            {!unlocked && (
                <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.96)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                    <div style={{ fontSize: "72px" }}>🔒</div>
                    <p style={{ color: "white", fontSize: "18px", textAlign: "center" }}>{t.pinLocked}</p>
                    <button onClick={() => setPinMode("unlock")} style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "16px", cursor: "pointer", marginTop: "8px" }}>{t.enterPin}</button>
                </div>
            )}

            {/* ── Top Bar ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", flexShrink: 0 }}>
                {/* Left: close current view (× only) */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "32px" }}>
                    {(centerView || audioSubScreen) && (
                        <button
                            onClick={handleBack}
                            style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(128,0,0,0.2)", border: "none", borderRadius: "8px", padding: "6px 10px", color: "#b91c1c", cursor: "pointer" }}>
                            <i className="fas fa-times" style={{ fontSize: "13px" }} />
                        </button>
                    )}
                </div>

                {/* Right: theme toggle → GPS → wifi */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button onClick={() => setTheme(isDark ? "light" : "dark")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: tp, fontSize: "18px", display: "flex", alignItems: "center" }}>
                        <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`} />
                    </button>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: ts, fontSize: "12px" }}>
                        <i className="fas fa-satellite-dish" /> GPS
                    </span>
                    <i className="fas fa-wifi" style={{ color: ts, fontSize: "14px" }} />
                </div>
            </div>

            {/* ── Main ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: isLandscape ? "row" : "column", gap: "12px", padding: "0 12px 12px", overflow: "hidden" }}>

                {/* Center Panel */}
                <div className="glass" style={{
                    order: isLandscape ? 2 : 1,
                    flex: isLandscape ? 1 : "0 0 44%",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    background: centerBg,
                    border: `1px solid ${isDark ? "rgba(0,0,0)" : "rgba(128,0,0,0.2)"}`,
                    overflow: "hidden",
                }}>
                    {/* Back button inside center panel */}
                    <div style={{ position: "absolute", top: "8px", ...(isAr ? { right: "8px" } : { left: "8px" }), zIndex: 10 }}>
                        <button
                            onClick={() => window.history.back()}
                            style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(128,0,0,0.18)", border: "none", borderRadius: "8px", padding: "5px 10px", color: "#b91c1c", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                            <i className={`fas fa-chevron-${isAr ? "right" : "left"}`} style={{ fontSize: "11px" }} />
                            <span style={{ fontSize: "10px", fontWeight: "bold", fontFamily: "'Cairo',sans-serif" }}>{t.back}</span>
                        </button>
                    </div>

                    {/* ── Toasts View (full panel) ── */}
                    {toasts.length > 0 && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "20px" }}>
                            {toasts.map(x => {
                                const col = toastColors[x.type] || "#374151";
                                return (
                                    <div key={x.id} className={`toast${x.die ? " die" : ""}`}
                                        onClick={() => setSnoozeMenu({ id: x.id, title: x.title, type: x.type, icon: x.icon, sub: x.sub })}
                                        style={{ width: "100%", background: col, borderRadius: "24px", padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", boxShadow: `0 0 60px 12px ${col}55`, direction: isAr ? "rtl" : "ltr" }}>
                                        {x.icon && (
                                            <span style={{ fontSize: "52px", lineHeight: 1 }}>{x.icon}</span>
                                        )}
                                        <p style={{ color: "white", fontWeight: "bold", fontSize: "20px", textAlign: "center", margin: 0 }}>
                                            {x.title}
                                        </p>
                                        {x.sub && (
                                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", textAlign: "center", margin: 0 }}>
                                                {x.sub}
                                            </p>
                                        )}
                                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", marginTop: "4px" }}>
                                            {isAr ? "اضغط لخيارات التأجيل" : "Tap to snooze"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── AI Default View ── */}
                    {centerView === null && toasts.length === 0 && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            <img src={!isDark ? "/images/dark-logo.png" : "/images/main-logo.png"} alt="قمرة" style={{ height: "52px", objectFit: "contain", marginTop: "10px" }} />
                            <img
                                src={`/images/${aiAssistant === "sakr" ? "hamad" : "Sheikha"}-${aiState === "speaking" ? "talk" : "stop"}-${isDark ? "dark" : "white"}.gif`}
                                style={{ width: "90%", flex: 1, objectFit: "contain", transition: "opacity .3s", filter: aiState === "speaking" ? "drop-shadow(0 20px 40px rgba(100,180,255,0.4))" : "none" }}
                                alt=""
                            />
                            {aiState === "thinking" && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ width: "56px", height: "56px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #60a5fa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                </div>
                            )}
                            {(aiCaption || aiText) && (
                                <div style={{ position: "absolute", bottom: "56px", left: "50%", transform: "translateX(-50%)", maxWidth: "85%", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                                    {aiCaption && <div style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "6px 14px", borderRadius: "20px", textAlign: "center" }}>🎤 {aiCaption}</div>}
                                    {aiText && <div style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(96,165,250,0.4)", color: "white", fontSize: "13px", padding: "8px 16px", borderRadius: "20px", textAlign: "center" }}>{aiText}</div>}
                                </div>
                            )}
                            {/* Mic + Vehicle info */}
                            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", borderRadius: "20px", padding: "5px 12px", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "white", fontSize: "11px" }}>
                                        <i className="fas fa-tachometer-alt" /><span style={{ fontWeight: "bold" }}>{vehicleData ? Number(vehicleData.km).toLocaleString() : "—"}</span>
                                    </div>
                                    <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.2)" }} />
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "white", fontSize: "11px" }}>
                                        <i className="fas fa-id-card" /><span style={{ fontWeight: "bold" }}>{vehicleData?.plateNumber ?? "—"}</span>
                                    </div>
                                    <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.2)" }} />
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "white", fontSize: "11px" }}>
                                        <i className="fas fa-car" /><span style={{ fontWeight: "bold" }}>{vehicleData ? `${isAr ? vehicleData.nameAr : (vehicleData.nameEn || vehicleData.nameAr)} ${vehicleData.year}` : "—"}</span>
                                    </div>
                                </div>
            
                            </div>
                        </div>
                    )}

                    {/* ── Notes View ── */}
                    {centerView === "notes" && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px", gap: "8px", overflowY: "auto", direction: isAr ? "rtl" : "ltr" }}>
                            <p style={{ fontWeight: "bold", fontSize: "16px", color: tp }}>📝 {t.notes}</p>
                            <input value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))}
                                placeholder={t.noteTitle}
                                style={{ width: "100%", background: rowBg, color: tp, fontSize: "13px", borderRadius: "8px", padding: "8px 10px", outline: "none", border: "none", textAlign: isAr ? "right" : "left" }} />
                            <textarea value={noteForm.body} onChange={e => setNoteForm(f => ({ ...f, body: e.target.value }))}
                                placeholder={t.noteBody} rows={2}
                                style={{ width: "100%", background: rowBg, color: tp, fontSize: "13px", borderRadius: "8px", padding: "8px 10px", outline: "none", border: "none", resize: "none", textAlign: isAr ? "right" : "left" }} />
                            <div style={{ display: "flex", gap: "6px" }}>
                                <input type="date" value={noteForm.date} onChange={e => setNoteForm(f => ({ ...f, date: e.target.value }))}
                                    style={{ flex: 1, background: rowBg, color: tp, fontSize: "12px", borderRadius: "8px", padding: "6px 8px", outline: "none", border: "none" }} />
                                <input type="time" value={noteForm.time} onChange={e => setNoteForm(f => ({ ...f, time: e.target.value }))}
                                    style={{ flex: 1, background: rowBg, color: tp, fontSize: "12px", borderRadius: "8px", padding: "6px 8px", outline: "none", border: "none" }} />
                            </div>
                            <button onClick={saveNote} style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: "8px", padding: "7px", fontSize: "13px", cursor: "pointer" }}>+ {t.saveNote}</button>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                                {notesList.map(n => (
                                    <div key={n.id} style={{ background: rowBg, borderRadius: "10px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <button onClick={() => delNote(n.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px", paddingLeft: "4px" }}>🗑</button>
                                        <div style={{ textAlign: "right", flex: 1 }}>
                                            {n.title && <p style={{ color: tp, fontWeight: "bold", fontSize: "13px" }}>{n.title}</p>}
                                            {n.body  && <p style={{ color: ts, fontSize: "12px", marginTop: "2px" }}>{n.body}</p>}
                                            <p style={{ color: tm, fontSize: "10px", marginTop: "3px" }}>{n.date && `📅 ${n.date}`} {n.time && `⏰ ${n.time}`}</p>
                                        </div>
                                    </div>
                                ))}
                                {notesList.length === 0 && <p style={{ color: tm, textAlign: "center", fontSize: "13px" }}>{t.noNotes}</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Reminders View ── */}
                    {centerView === "reminders" && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px", gap: "8px", direction: isAr ? "rtl" : "ltr" }}>
                            <p style={{ fontWeight: "bold", fontSize: "16px", color: tp }}>🔔 {t.reminders}</p>
                            {/* 2 tabs */}
                            <div style={{ display: "flex", gap: "6px" }}>
                                {[{ k: "upcoming", l: t.upcoming }, { k: "completed", l: t.completed }].map(tab => (
                                    <button key={tab.k} onClick={() => setReminderTab(tab.k)}
                                        style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "12px", background: reminderTab === tab.k ? "#b91c1c" : rowBg, color: reminderTab === tab.k ? "white" : tp, transition: "all .2s" }}>
                                        {tab.l}
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                                {(allReminders.filter(r => reminderTab === "upcoming" ? !r.completed : r.completed)).map(r => (
                                    <div key={r.id} style={{ background: rowBg, borderRadius: "10px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <p style={{ color: tp, fontWeight: "bold", fontSize: "13px" }}>{r.titleAr}</p>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                                                {r.dueDate && <span style={{ color: tm, fontSize: "11px" }}>📅 {r.dueDate}</span>}
                                                {r.dueTime && <span style={{ color: "#f59e0b", fontSize: "11px", fontWeight: "bold" }}>⏰ {to12h(r.dueTime, isAr)}</span>}
                                            </div>
                                        </div>
                                        {r.notes && <p style={{ color: ts, fontSize: "11px" }}>{r.notes}</p>}
                                        {r.completed && <span style={{ fontSize: "10px", color: "#4ade80" }}>✅ {t.completed}</span>}
                                    </div>
                                ))}
                                {allReminders.filter(r => reminderTab === "upcoming" ? !r.completed : r.completed).length === 0 && (
                                    <p style={{ color: tm, textAlign: "center", fontSize: "13px", marginTop: "20px" }}>{t.noReminders}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Quran View ── */}
                    {centerView === "quran" && (
                        <div style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "8px 12px 16px", direction: "rtl" }}>
                            <p style={{ fontWeight: "bold", fontSize: "15px", color: tp, marginBottom: "8px", textAlign: "center" }}>
                                📖 {t.quran}
                            </p>
                            {SURAH_NAMES.map((name, i) => {
                                const ch = CHANNELS.quran[i];
                                const active = nowPlaying?.url === ch.url;
                                return (
                                    <div key={i}
                                        onClick={() => active && isPlaying ? togglePlay() : playChannel(ch)}
                                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", marginBottom: "4px", background: active ? "rgba(6,95,70,0.25)" : (isDark ? "rgba(255,255,255,0.05)" : "#fff"), border: `1px solid ${active ? "#065f46" : (isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb")}`, borderRadius: "10px", cursor: "pointer" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: active ? "#065f46" : "rgba(6,95,70,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <i className={`fas ${active && isPlaying ? "fa-pause" : "fa-play"}`} style={{ color: "white", fontSize: "10px" }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ color: tp, fontSize: "13px", fontWeight: active ? "bold" : "normal" }}>
                                                {i + 1}. سورة {name}
                                            </span>
                                            {active && !audioError && (
                                                <p style={{ color: "#065f46", fontSize: "10px", margin: 0 }}>
                                                    {isPlaying ? "▶ يُشغَّل..." : "⏸ متوقف"}
                                                    {audioDur > 0 && ` • ${fmtTime(audioCurrent)} / ${fmtTime(audioDur)}`}
                                                </p>
                                            )}
                                        </div>
                                        <span style={{ color: ts, fontSize: "11px" }}>العجمي</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Audio View ── */}
                    {centerView === "audio" && (
                        <div style={{ flex: 1, minHeight: 0, position: "relative", direction: isAr ? "rtl" : "ltr", overflow: "hidden" }}>

                            {/* Category screen */}
                            {!audioSubScreen && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "12px", gap: "10px", overflowY: "auto" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <img src={!isDark ? "/images/dark-logo.png" : "/images/main-logo.png"} style={{ height: "36px", objectFit: "contain" }} alt="قمرة" />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        {[
                                            { key: "quran",      icon: "fa-quran",      label: t.quran,      bg: "linear-gradient(135deg,#065f46,#047857)", direct: true },
                                            { key: "audiobooks", icon: "fa-headphones", label: t.audiobooks, bg: "linear-gradient(135deg,#1e3a5f,#1d4ed8)" },
                                            { key: "radio",      icon: "fa-radio",      label: t.radio,      bg: "linear-gradient(135deg,#7c2d12,#b91c1c)" },
                                            { key: "ruqyah",     icon: "fa-leaf",       label: t.ruqyah,     bg: "linear-gradient(135deg,#14532d,#15803d)" },
                                        ].map(a => (
                                            <div key={a.key} onClick={() => a.direct ? setCenterView(a.key) : setAudioSubScreen(a.key)}
                                                style={{ background: a.bg, borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                                <i className={`fas ${a.icon}`} style={{ fontSize: "26px", color: "white" }} />
                                                <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>{a.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Channel list — absolute fill, guaranteed scroll */}
                            {audioSubScreen && (
                                <div style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "8px 12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <button onClick={() => setAudioSubScreen(null)} style={{ background: "none", border: "none", color: ts, cursor: "pointer", fontSize: "13px", textAlign: isAr ? "right" : "left", padding: "4px 0", flexShrink: 0 }}>
                                        ← {isAr ? "رجوع" : "Back"}
                                    </button>
                                    {(CHANNELS[audioSubScreen] || []).map((ch, i) => {
                                        const active  = nowPlaying?.url === ch.url;
                                        const saved   = bookProgress[ch.url];
                                        const pct     = active
                                            ? (audioDur > 0 ? (audioCurrent / audioDur) * 100 : 0)
                                            : (saved?.duration > 0 ? (saved.currentTime / saved.duration) * 100 : 0);
                                        const hasProgress = (active && audioCurrent > 3) || (!active && saved?.currentTime > 3);
                                        return (
                                            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0", background: active ? (isDark ? "rgba(185,28,28,0.25)" : "rgba(185,28,28,0.12)") : rowBg, border: `1px solid ${active ? "#b91c1c" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)")}`, borderRadius: "10px", overflow: "hidden", cursor: "pointer", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)" }}>
                                                <div onClick={() => active && isPlaying ? togglePlay() : playChannel(ch)}
                                                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px" }}>
                                                    {ch.cover
                                                        ? <img src={ch.cover} alt="" style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, border: active ? "2px solid #b91c1c" : "2px solid transparent" }} />
                                                        : <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: active ? "#b91c1c" : "rgba(185,28,28,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                            <i className={`fas ${active && isPlaying ? "fa-pause" : "fa-play"}`} style={{ color: "white", fontSize: "11px" }} />
                                                          </div>
                                                    }
                                                    <div style={{ flex: 1, textAlign: isAr ? "right" : "left" }}>
                                                        <p style={{ color: tp, fontSize: "13px", fontWeight: active ? "bold" : "normal" }}>{isAr ? ch.ar : ch.en}</p>
                                                        {active && !audioError && (
                                                            <p style={{ color: "#b91c1c", fontSize: "10px" }}>
                                                                {isPlaying ? (isAr ? "▶ يُشغَّل..." : "▶ Playing...") : (isAr ? "⏸ متوقف" : "⏸ Paused")}
                                                                {audioDur > 0 && ` • ${fmtTime(audioCurrent)} / ${fmtTime(audioDur)}`}
                                                            </p>
                                                        )}
                                                        {!active && hasProgress && saved && (
                                                            <p style={{ color: ts, fontSize: "10px" }}>
                                                                {isAr ? "استكمال من" : "Resume from"} {fmtTime(saved.currentTime)}
                                                                {saved.duration > 0 && ` / ${fmtTime(saved.duration)}`}
                                                            </p>
                                                        )}
                                                        {active && audioError && <p style={{ color: "#ef4444", fontSize: "10px" }}>⚠️ {isAr ? "البث غير متاح" : "Unavailable"}</p>}
                                                    </div>
                                                    {ch.cover && (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                                                            <div onClick={e => { e.stopPropagation(); active && isPlaying ? togglePlay() : playChannel(ch); }}
                                                                style={{ width: "26px", height: "26px", borderRadius: "50%", background: active ? "#b91c1c" : "rgba(185,28,28,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                <i className={`fas ${active && isPlaying ? "fa-pause" : "fa-play"}`} style={{ color: "white", fontSize: "10px" }} />
                                                            </div>
                                                            {hasProgress && (
                                                                <button onClick={e => { e.stopPropagation(); if (active) stopAudio(); clearBookPos(ch.url); }}
                                                                    style={{ background: "none", border: "none", color: ts, fontSize: "9px", cursor: "pointer", padding: "0" }}
                                                                    title={isAr ? "مسح التقدم" : "Clear progress"}>
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {hasProgress && (
                                                    <div style={{ height: "3px", background: "rgba(185,28,28,0.15)" }}>
                                                        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "#b91c1c", transition: "width .5s" }} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Now playing row */}
                            {nowPlaying && (
                                <div style={{ marginTop: "auto", paddingTop: "8px", background: "rgba(185,28,28,0.15)", borderRadius: "10px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "14px" }}>{audioError ? "⚠️" : "🎵"}</span>
                                    <span style={{ flex: 1, color: tp, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isAr ? nowPlaying.ar : nowPlaying.en}</span>
                                    {!audioError && <button onClick={togglePlay} style={{ background: "#b91c1c", border: "none", borderRadius: "50%", width: "26px", height: "26px", color: "white", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`} />
                                    </button>}
                                    <button onClick={stopAudio} style={{ background: "rgba(185,28,28,0.2)", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: tp, cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <i className="fas fa-stop" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Side Panel ── */}
                <div style={{
                    order: isLandscape ? 1 : 2,
                    width: isLandscape ? "30%" : "100%",
                    flex: isLandscape ? "0 0 30%" : "1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    overflowY: "auto",
                    minHeight: 0,
                }}>
                    {/* Clock */}
                    <div className="glass" style={{ padding: "10px", display: "flex", flexDirection: "column", alignItems: "center", background: cardBg, flexShrink: 0 }}>
                        <AnalogClock now={now} size={80} />
                        <div style={{ fontSize: "11px", color: ts, marginTop: "4px" }}>{dateStr}</div>
                        <div style={{ fontSize: "12px", color: tp, marginTop: "2px" }}>25°C</div>
                    </div>

                    {/* Apps Grid */}
                    <div className="glass" style={{ padding: "8px", background: cardBg, display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                        {/* Home — full width */}
                        <div onClick={() => setCenterView(null)}
                            style={{ width: "100%", background: "linear-gradient(135deg,#800000,#5a0000)", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <i className="fas fa-home" style={{ color: "white", fontSize: "14px" }} />
                            <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>{t.home}</span>
                        </div>

                        {/* 2x2 grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                            {sideApps.map((a, i) => (
                                <div key={i} onClick={a.onClick}
                                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", padding: "6px 4px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", background: a.bg }}>
                                        <i className={`fas ${a.icon}`} style={{ color: "white" }} />
                                    </div>
                                    <span style={{ fontSize: "9px", color: ts, textAlign: "center" }}>{a.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Settings — full width */}
                        <div onClick={() => setSettingsOpen(true)}
                            style={{ width: "100%", background: "linear-gradient(135deg,#1a1a1a,#333)", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <i className="fas fa-cog" style={{ color: "white", fontSize: "14px" }} />
                            <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>{t.settings}</span>
                        </div>
                    </div>

                    {/* Upcoming Notes */}
                    {upcomingNotes.length > 0 && (
                        <div className="glass" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "6px", background: cardBg, flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: tp, fontSize: "12px", fontWeight: "bold" }}>
                                <i className="fas fa-sticky-note" /><span>{t.upcomingNotes}</span>
                            </div>
                            {upcomingNotes.map(n => (
                                <div key={n.id} style={{ background: rowBg, borderRadius: "8px", padding: "7px 10px" }}>
                                    <p style={{ color: tp, fontSize: "12px", fontWeight: "600" }}>{n.title}</p>
                                    <p style={{ color: tm, fontSize: "10px" }}>📅 {n.date} {n.time && `⏰ ${n.time}`}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Maintenance */}
                    <div className="glass" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px", background: cardBg, flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: tp, fontSize: "12px", fontWeight: "bold" }}>
                            <i className="fas fa-tools" /><span>{t.maintenance}</span>
                        </div>
                        {nextReminder ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <div style={{ color: "#60a5fa", display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", fontWeight: "600" }}>
                                    <i className="fas fa-wrench" /><span>{nextReminder.titleAr}</span>
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {nextReminder.dueTime && <span style={{ color: tm, fontSize: "11px" }}>⏰ {to12h(nextReminder.dueTime, isAr)}</span>}
                                    {nextReminder.notes   && <span style={{ color: tm, fontSize: "11px" }}>{nextReminder.notes}</span>}
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: tm, fontSize: "11px" }}>{vehicleData ? "لا توجد تنبيهات" : "—"}</div>
                        )}
                    </div>

                    {/* Prayer */}
                    {prayerOn && (
                        <div className="glass" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px", background: cardBg, flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: tp, fontSize: "12px", fontWeight: "bold" }}>
                                <i className="fas fa-mosque" /><span>{t.prayerNext}</span>
                            </div>
                            {nextPrayer
                                ? <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#60a5fa", fontSize: "12px", fontWeight: "600" }}>
                                    <i className="fas fa-sun" />
                                    <span>{t.prayerNames[nextPrayer.name]} {to12h(nextPrayer.time, isAr)}</span>
                                  </div>
                                : <div style={{ color: tm, fontSize: "11px" }}>...</div>
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden audio */}
            <audio ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => { setIsPlaying(false); if (nowPlaying?.cover) clearBookPos(nowPlaying.url); }}
                onError={() => { setAudioError(true); setIsPlaying(false); }}
                style={{ display: "none" }} />
            {/* Notification audio (AI voice sounds only) */}
            <audio ref={notifAudioRef} style={{ display: "none" }} />
            {/* دعاء الركوب audio */}
            <audio ref={doaaRef} style={{ display: "none" }} />

            {/* Mini player bar */}
            {nowPlaying && centerView !== "audio" && (
                <div style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 40, display: "flex", alignItems: "center", gap: "10px", background: isDark ? "rgba(20,0,0,0.92)" : "rgba(255,248,248,0.95)", backdropFilter: "blur(12px)", border: `1px solid ${audioError ? "rgba(239,68,68,0.5)" : "rgba(185,28,28,0.4)"}`, borderRadius: "30px", padding: "8px 16px", maxWidth: "320px", width: "90%", direction: isAr ? "rtl" : "ltr" }}>
                    <span style={{ fontSize: "16px" }}>{audioError ? "⚠️" : "🎵"}</span>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        <p style={{ color: tp, fontSize: "12px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isAr ? nowPlaying.ar : nowPlaying.en}</p>
                        {audioError && <p style={{ color: "#ef4444", fontSize: "10px" }}>{isAr ? "تعذّر تشغيل البث" : "Stream unavailable"}</p>}
                    </div>
                    {!audioError && <button onClick={togglePlay} style={{ background: "#b91c1c", border: "none", borderRadius: "50%", width: "26px", height: "26px", color: "white", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`} />
                    </button>}
                    <button onClick={stopAudio} style={{ background: "rgba(185,28,28,0.2)", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: tp, cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fas fa-stop" />
                    </button>
                </div>
            )}

            {/* ══ Settings Modal ══ */}
            {settingsOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
                    <div style={{ width: "100%", maxWidth: "400px", margin: "0 16px", borderRadius: "16px", overflowY: "auto", maxHeight: "90vh", background: sBg, direction: isAr ? "rtl" : "ltr" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            <button onClick={() => setSettingsOpen(false)} style={{ color: ts, background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>{t.goBack}</button>
                            <h2 style={{ color: tp, fontWeight: "bold", fontSize: "18px" }}>{t.settingsTitle}</h2>
                        </div>
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>

                            {/* Assistant selector */}
                            <div style={{ background: rowBg, borderRadius: "12px", padding: "12px 16px" }}>
                                <p style={{ color: tp, fontSize: "14px", textAlign: "right", marginBottom: "10px" }}>{t.assistantLabel}</p>
                                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                    {[
                                        { k: "hamda", img: `/images/Sheikha-stop-${isDark ? "dark" : "white"}.gif`, name: isAr ? "شيخة" : "Sheikha" },
                                        { k: "sakr",  img: `/images/hamad-stop-${isDark ? "dark" : "white"}.gif`,   name: isAr ? "حمد"   : "Hamad" },
                                    ].map(a => (
                                        <div key={a.k} onClick={() => setAiAssistant(a.k)}
                                            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 6px", borderRadius: "12px", cursor: "pointer", border: `2px solid ${aiAssistant === a.k ? "#b91c1c" : "transparent"}`, background: aiAssistant === a.k ? "rgba(185,28,28,0.15)" : "rgba(255,255,255,0.05)", transition: "all .2s" }}>
                                            <img src={a.img} alt={a.name} style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "10px" }} />
                                            <span style={{ color: tp, fontSize: "13px", fontWeight: "bold" }}>{a.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Theme */}
                            <SRow bg={rowBg} label={t.appearance} tc={tp}>
                                <BtnG opts={[{ k: "light", l: `☀️ ${t.light}` }, { k: "dark", l: `🌙 ${t.dark}` }]} val={theme} set={setTheme} />
                            </SRow>

                            {/* Language */}
                            <SRow bg={rowBg} label={t.language} tc={tp}>
                                <BtnG opts={[{ k: "en", l: "English" }, { k: "ar", l: "العربية" }]} val={lang} set={setLang} />
                            </SRow>

                            {/* Brightness */}
                            <div style={{ background: rowBg, borderRadius: "12px", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: tm, fontSize: "12px" }}>{brt}%</span>
                                    <span style={{ color: tp, fontSize: "14px" }}>{t.brightness}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ color: "#facc15" }}>☀️</span>
                                    <input type="range" min="20" max="100" value={brt} style={{ flex: 1 }} onChange={e => setBrt(Number(e.target.value))} />
                                    <span style={{ color: tm }}>⚙️</span>
                                </div>
                            </div>

                            {/* Notifications */}
                            <SRow bg={rowBg} label={t.notifications} tc={tp}>
                                <div className={`tgl ${notifOn ? "on" : "off"}`} onClick={() => setNotif(!notifOn)}><div className="knob" /></div>
                            </SRow>

                            {/* Prayer notification */}
                            <SRow bg={rowBg} label={t.prayerNotif} tc={tp}>
                                <div className={`tgl ${prayerOn ? "on" : "off"}`} onClick={() => setPrayerOn(!prayerOn)}><div className="knob" /></div>
                            </SRow>

                            <SRow bg={rowBg} label={t.prayerNotifTitle} tc={tp}>
                                <div className={`tgl ${doaaOn ? "on" : "off"}`} onClick={() => setDoaaOn(!doaaOn)}><div className="knob" /></div>
                            </SRow>

                            {/* PIN */}
                            <div style={{ background: rowBg, borderRadius: "12px", padding: "12px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={openSetPin} style={{ background: "#b91c1c", color: "white", fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>{t.setPin}</button>
                                        {savedPin && <button onClick={deletePin} style={{ background: "rgba(255,255,255,0.1)", color: tp, fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>{t.deletePin}</button>}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ color: tp, fontSize: "14px" }}>{t.pinSecurity}</span>
                                        <p style={{ color: tm, fontSize: "12px" }}>{savedPin ? t.pinActive : t.noPin}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ══ Snooze Menu ══ */}
            {snoozeMenu && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", direction: isAr ? "rtl" : "ltr" }}
                    onClick={() => setSnoozeMenu(null)}>
                    <div onClick={e => e.stopPropagation()}
                        style={{ background: ppBg, borderRadius: "20px", padding: "20px 16px", width: "280px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <p style={{ color: tp, fontWeight: "bold", fontSize: "15px", textAlign: "center" }}>
                            {snoozeMenu.icon && <span style={{ marginInlineEnd: "6px" }}>{snoozeMenu.icon}</span>}
                            {snoozeMenu.title}
                        </p>
                        {snoozeMenu.sub && (
                            <p style={{ color: ts, fontSize: "12px", textAlign: "center", marginTop: "-4px" }}>{snoozeMenu.sub}</p>
                        )}
                        <p style={{ color: tm, fontSize: "12px", textAlign: "center" }}>{isAr ? "إعادة التذكير" : "Remind me again"}</p>
                        {[
                            { label: isAr ? "بعد 10 دقائق"  : "In 10 minutes",  ms: 600000  },
                            { label: isAr ? "بعد 20 دقيقة"  : "In 20 minutes",  ms: 1200000 },
                            { label: isAr ? "بعد 30 دقيقة"  : "In 30 minutes",  ms: 1800000 },
                        ].map(opt => (
                            <button key={opt.ms} onClick={() => {
                                const snap = { ...snoozeMenu };
                                setToasts(p => p.filter(t => t.id !== snap.id));
                                setSnoozeMenu(null);
                                setTimeout(() => addToast(snap.title, snap.type, snap.icon, snap.sub), opt.ms);
                            }}
                                style={{ background: rowBg, color: tp, border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", textAlign: "center" }}>
                                {opt.label}
                            </button>
                        ))}
                        <button onClick={() => { setToasts(p => p.filter(t => t.id !== snoozeMenu.id)); setSnoozeMenu(null); }}
                            style={{ background: "rgba(185,28,28,0.15)", color: "#ef4444", border: "1px solid rgba(185,28,28,0.3)", borderRadius: "12px", padding: "10px", fontSize: "13px", cursor: "pointer" }}>
                            {isAr ? "إغلاق" : "Dismiss"}
                        </button>
                    </div>
                </div>
            )}

            {/* ══ PIN Modal ══ */}
            {pinModalOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)", direction: isAr ? "rtl" : "ltr" }}>
                    <div className={shakePin ? "shk" : ""} style={{ background: ppBg, borderRadius: "16px", padding: "24px", width: "292px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            {pinMode !== "unlock" ? <button onClick={closePin} style={{ color: tm, background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button> : <div />}
                            <h3 style={{ color: tp, fontWeight: "bold" }}>{t.pinTitle}</h3>
                        </div>
                        <p style={{ textAlign: "center", color: ts, fontSize: "13px", marginBottom: "8px" }}>{pinLabel}</p>
                        {pinErr && <p style={{ textAlign: "center", color: "#ef4444", fontSize: "12px", marginBottom: "6px" }}>{pinErr}</p>}
                        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "22px" }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${i < dotsCount ? "#b91c1c" : "rgba(255,255,255,0.3)"}`, background: i < dotsCount ? "#b91c1c" : "transparent", transition: "all .15s" }} />
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                            {[1,2,3,4,5,6,7,8,9].map(n => (
                                <button key={n} onClick={() => pinPress(n)} style={{ background: pbBg, color: tp, fontWeight: 500, padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "18px" }}>{n}</button>
                            ))}
                            <button onClick={pinDel} style={{ background: pbBg, color: tp, padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "18px" }}>⌫</button>
                            <button onClick={() => pinPress(0)} style={{ background: pbBg, color: tp, fontWeight: 500, padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "18px" }}>0</button>
                            <div />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
