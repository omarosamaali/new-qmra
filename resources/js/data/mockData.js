export const vehicles = [
    {
        id: 1,
        nameAr: "كامري",
        nameEn: "Camry",
        brand: "Toyota",
        type: "sedan",
        plateNumber: "A B C 1234",
        km: 85000,
        color: "#800000",
        year: 2021,
        image: null,
    },
    {
        id: 2,
        nameAr: "لاند كروزر",
        nameEn: "Land Cruiser",
        brand: "Toyota",
        type: "suv",
        plateNumber: "D E F 5678",
        km: 120500,
        color: "#800000",
        year: 2020,
        image: null,
    },
    {
        id: 3,
        nameAr: "كورولا",
        nameEn: "Corolla",
        brand: "Toyota",
        type: "sedan",
        plateNumber: "G H I 9012",
        km: 45200,
        color: "#800000",
        year: 2023,
        image: null,
    },
];

export const services = [
    { id: 1, nameAr: "تغيير الزيت",   nameEn: "Oil Change",   icon: "🛢️" },
    { id: 2, nameAr: "فلتر الهواء",   nameEn: "Air Filter",   icon: "💨" },
    { id: 3, nameAr: "الإطارات",       nameEn: "Tires",        icon: "⚙️" },
    { id: 4, nameAr: "الفرامل",        nameEn: "Brakes",       icon: "🔧" },
    { id: 5, nameAr: "البطارية",       nameEn: "Battery",      icon: "🔋" },
    { id: 6, nameAr: "فلتر الكابين",  nameEn: "Cabin Filter", icon: "🌬️" },
];

export const reminders = [
    { id: 1,  vehicleId: 1, serviceId: 1, titleAr: "تغيير الزيت",      dueDate: "2026-05-15", dueKm: 90000,  completed: false },
    { id: 2,  vehicleId: 1, serviceId: 2, titleAr: "فلتر الهواء",      dueDate: "2026-07-01", dueKm: null,   completed: false },
    { id: 3,  vehicleId: 1, serviceId: 3, titleAr: "فحص الإطارات",     dueDate: "2026-06-20", dueKm: 95000,  completed: false },
    { id: 4,  vehicleId: 1, serviceId: 4, titleAr: "فحص الفرامل",      dueDate: "2026-08-10", dueKm: null,   completed: false },
    { id: 5,  vehicleId: 1, serviceId: 6, titleAr: "فلتر الكابين",     dueDate: "2026-09-01", dueKm: 100000, completed: false },
    { id: 6,  vehicleId: 2, serviceId: 1, titleAr: "تغيير الزيت",      dueDate: "2026-04-20", dueKm: 125000, completed: false },
    { id: 7,  vehicleId: 2, serviceId: 4, titleAr: "فحص الفرامل",      dueDate: "2026-05-30", dueKm: 130000, completed: false },
    { id: 8,  vehicleId: 2, serviceId: 3, titleAr: "فحص الإطارات",     dueDate: "2026-07-15", dueKm: 135000, completed: false },
    { id: 9,  vehicleId: 3, serviceId: 5, titleAr: "تغيير البطارية",   dueDate: "2026-08-01", dueKm: null,   completed: false },
    { id: 10, vehicleId: 3, serviceId: 1, titleAr: "تغيير الزيت",      dueDate: "2026-05-01", dueKm: 50000,  completed: false },
];

// خدمات كل مركبة على حدة — كل مركبة ممكن يكون لها خدمات مختلفة
export const vehicleServices = [
    // كامري
    { id: 1,  vehicleId: 1, serviceId: 1, intervalKm: 5000,  intervalDays: 90,   notes: "5W-30" },
    { id: 2,  vehicleId: 1, serviceId: 2, intervalKm: 20000, intervalDays: 365,  notes: "" },
    { id: 3,  vehicleId: 1, serviceId: 3, intervalKm: 30000, intervalDays: 730,  notes: "Michelin" },
    { id: 4,  vehicleId: 1, serviceId: 4, intervalKm: 40000, intervalDays: null, notes: "" },
    { id: 5,  vehicleId: 1, serviceId: 6, intervalKm: 15000, intervalDays: 180,  notes: "" },

    // لاند كروزر
    { id: 6,  vehicleId: 2, serviceId: 1, intervalKm: 7500,  intervalDays: 120,  notes: "5W-40 full synthetic" },
    { id: 7,  vehicleId: 2, serviceId: 3, intervalKm: 40000, intervalDays: 730,  notes: "Bridgestone" },
    { id: 8,  vehicleId: 2, serviceId: 4, intervalKm: 50000, intervalDays: null, notes: "" },

    // كورولا
    { id: 9,  vehicleId: 3, serviceId: 1, intervalKm: 5000,  intervalDays: 90,   notes: "0W-20" },
    { id: 10, vehicleId: 3, serviceId: 5, intervalKm: null,  intervalDays: 1095, notes: "70 Ah" },
    { id: 11, vehicleId: 3, serviceId: 2, intervalKm: 20000, intervalDays: 365,  notes: "" },
];

export const warranties = [
    { id: 1, vehicleId: 1, titleAr: "ضمان المحرك",     titleEn: "Engine Warranty",        icon: "🔩", expiryDate: "2026-12-31", provider: "Toyota Abu Dhabi",   notes: "" },
    { id: 2, vehicleId: 1, titleAr: "ضمان الهيكل",     titleEn: "Body Warranty",          icon: "🚗", expiryDate: "2027-06-30", provider: "Toyota Abu Dhabi",   notes: "" },
    { id: 3, vehicleId: 2, titleAr: "ضمان المحرك",     titleEn: "Engine Warranty",        icon: "🔩", expiryDate: "2025-08-15", provider: "Toyota UAE",         notes: "" },
    { id: 4, vehicleId: 2, titleAr: "ضمان الكهرباء",   titleEn: "Electrical Warranty",    icon: "⚡", expiryDate: "2026-03-10", provider: "Toyota UAE",         notes: "" },
    { id: 5, vehicleId: 3, titleAr: "ضمان شامل",       titleEn: "Comprehensive Warranty", icon: "🛡️", expiryDate: "2026-09-01", provider: "Toyota Abu Dhabi",   notes: "" },
    { id: 6, vehicleId: 3, titleAr: "ضمان البطارية",   titleEn: "Battery Warranty",       icon: "🔋", expiryDate: "2028-01-01", provider: "Toyota Abu Dhabi",   notes: "70 Ah" },
];

export const records = [
    { id: 1,  vehicleId: 1, serviceId: 1, date: "2026-01-15", km: 80000,  cost: 250,  notes: "تم التغيير في الوكالة",          provider: "Toyota Abu Dhabi" },
    { id: 2,  vehicleId: 1, serviceId: 2, date: "2025-12-10", km: 75000,  cost: 80,   notes: "فلتر أصلي",                      provider: "Al Ameen Workshop" },
    { id: 3,  vehicleId: 1, serviceId: 3, date: "2025-11-05", km: 70000,  cost: 1200, notes: "تغيير الإطارات الأمامية",         provider: "Tire Shop Dubai" },
    { id: 4,  vehicleId: 2, serviceId: 1, date: "2026-01-20", km: 115000, cost: 300,  notes: "زيت 5W-40",                      provider: "Land Cruiser Center" },
    { id: 5,  vehicleId: 2, serviceId: 4, date: "2025-10-15", km: 110000, cost: 450,  notes: "تغيير تيل الفرامل",               provider: "Al Najm Workshop" },
    { id: 6,  vehicleId: 3, serviceId: 5, date: "2025-09-01", km: 40000,  cost: 350,  notes: "بطارية 70 أمبير جديدة",          provider: "Battery Store" },
    { id: 7,  vehicleId: 1, serviceId: 1, date: "2025-08-10", km: 72000,  cost: 230,  notes: "",                               provider: "Al Amanah Workshop" },
    { id: 8,  vehicleId: 2, serviceId: 3, date: "2025-07-20", km: 105000, cost: 1800, notes: "تغيير الإطارات الأربعة",          provider: "Wheel & Tire Dubai" },
    { id: 9,  vehicleId: 3, serviceId: 1, date: "2025-06-05", km: 38000,  cost: 210,  notes: "",                               provider: "Gulf Workshop" },
    { id: 10, vehicleId: 1, serviceId: 4, date: "2025-05-12", km: 65000,  cost: 380,  notes: "تغيير أقراص الفرامل الأمامية",   provider: "Service Center" },
];
