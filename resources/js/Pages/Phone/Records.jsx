import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
};

const RecordCard = ({ record, vehicles, services }) => {
    const vehicle = vehicles.find((v) => v.id === record.vehicleId);
    const service = services.find((s) => s.id === record.serviceId);

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base leading-none">{service?.icon}</span>
                        <span className="font-semibold text-gray-900 text-sm">{service?.nameAr}</span>
                    </div>
                    {record.provider && (
                        <p className="text-xs text-gray-400 mt-0.5">{record.provider}</p>
                    )}
                </div>
                {record.cost > 0 && (
                    <span className="text-sm font-bold text-[#800000] shrink-0 ml-2">
                        {Number(record.cost).toLocaleString("en")} ر.س
                    </span>
                )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-3 pt-2.5 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-600">{vehicle?.nameAr}</span>
                    <span>&bull;</span>
                    <span>{vehicle?.plateNumber}</span>
                </div>
                <span>{Number(record.km).toLocaleString("en")} كم</span>
            </div>

            <div className="text-xs text-gray-400 mt-1">
                {formatDate(record.date)}
            </div>

            {record.notes && (
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">{record.notes}</p>
            )}
        </div>
    );
};

export default function Records({ vehicles = [], services = [], records = [], defaultServiceId = null, defaultVehicleId = null }) {
    const [selectedServiceId, setSelectedServiceId] = useState(
        defaultServiceId ? Number(defaultServiceId) : null
    );
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        defaultVehicleId ? Number(defaultVehicleId) : null
    );

    const filteredRecords = records.filter((r) => {
        if (selectedVehicleId && r.vehicleId !== selectedVehicleId) return false;
        if (selectedServiceId && r.serviceId !== selectedServiceId) return false;
        return true;
    });

    const filterBtnClass = (active) =>
        `px-3 py-2 rounded-xl text-sm font-medium shrink-0 transition-all duration-150 ${
            active ? "bg-[#800000] text-white" : "bg-white text-gray-700 shadow-sm"
        }`;

    return (
        <>
            <Head title="السجلات - قمرة" />
            <div className="min-h-screen bg-gray-100 flex justify-center" dir="rtl">
                <div className="w-full max-w-sm min-h-screen flex flex-col bg-gray-100">

                    <div className="bg-white flex items-center gap-3 sticky top-0 z-20 shadow-sm safe-header">
                        <button
                            onClick={() => router.get("/")}
                            className="w-9 h-17 flex items-center justify-center bg-[#800000] text-white active:opacity-80 transition-opacity"
                        >
                            <BackIcon />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg">السجلات</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-4 pb-10 space-y-4">

                            {/* Vehicle filter */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">المركبة</p>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    <button onClick={() => setSelectedVehicleId(null)} className={filterBtnClass(selectedVehicleId === null)}>
                                        الكل
                                    </button>
                                    {vehicles.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVehicleId((prev) => prev === v.id ? null : v.id)}
                                            className={filterBtnClass(selectedVehicleId === v.id)}
                                        >
                                            {v.nameAr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Service filter */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">الخدمة</p>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    <button onClick={() => setSelectedServiceId(null)} className={filterBtnClass(selectedServiceId === null)}>
                                        الكل
                                    </button>
                                    {services.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedServiceId((prev) => prev === s.id ? null : s.id)}
                                            className={`flex items-center gap-1.5 ${filterBtnClass(selectedServiceId === s.id)}`}
                                        >
                                            <span className="text-base leading-none">{s.icon}</span>
                                            <span>{s.nameAr}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-gray-400">{filteredRecords.length} سجل</p>

                            {filteredRecords.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center">
                                    <p className="text-gray-400 text-sm">لا توجد سجلات</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRecords.map((record) => (
                                        <RecordCard key={record.id} record={record} vehicles={vehicles} services={services} />
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
