import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { QRCodeCanvas } from "qrcode.react";

const LandInfoCard = ({ selectedLand }) => {
  if (!selectedLand) return null;

  const keyMap = {
    number: ["parcel_no", "number"],
    planNumber: ["PLAN_NUM", "planNumber"],
    status: ["status", "invested"],
    area: ["Shape_Area", "area"],
    ACTIV: ["ACTIV", "ACTIV_NAME", "type_project"],
    main_activ: ["main_activ", "mainActivity", "primary_activity"],
    rent: ["rent", "rental"],
    dis_nam: ["dis_nam", "district_name", "neighborhood"],
  };

  const getValue = (key, defaultValue = "غير محدد") => {
    const possibleKeys = keyMap[key] || [];
    for (let k of possibleKeys) {
      if (
        selectedLand.properties &&
        selectedLand.properties[k] !== undefined &&
        selectedLand.properties[k] !== null &&
        selectedLand.properties[k] !== ""
      ) {
        return selectedLand.properties[k];
      }
      if (
        selectedLand[k] !== undefined &&
        selectedLand[k] !== null &&
        selectedLand[k] !== ""
      ) {
        return selectedLand[k];
      }
    }
    return defaultValue;
  };

  const getStatusText = () => {
    const status = getValue("status");
    if (status === "مستثمر" || status === true) return "مستثمرة";
    if (status === "قيد الطرح") return "قيد الطرح";
    if (status === "تحت الإيجار") return "تحت الإيجار";
    return "غير مستثمرة";
  };

  const getStatusColor = () => {
    const statusText = getStatusText();
    if (statusText === "مستثمرة") return "text-red-400";
    if (statusText === "قيد الطرح") return "text-yellow-300";
    if (statusText === "تحت الإيجار") return "text-orange-300";
    return "text-green-300";
  };

  const getRentText = () => {
    return getStatusText() === "مستثمرة" ? "مؤجر" : "غير مؤجر";
  };

  const exportToExcel = () => {
    const exportData = {
      "رقم القطعة": getValue("number"),
      "رقم المخطط": getValue("planNumber"),
      "الحالة": getStatusText(),
      "المساحة (م²)": getValue("area"),
      "نوع المشروع": getValue("ACTIV"),
      "النشاط الرئيسي": getValue("main_activ"),
      "الإيجار": getRentText(),
      "الحي": getValue("dis_nam"),
    };

    const worksheet = XLSX.utils.json_to_sheet([exportData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Land Info");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "land-info.xlsx");
  };

  const infoItems = [
    { label: "رقم القطعة", value: getValue("number") },
    { label: "رقم المخطط", value: getValue("planNumber") },
    { label: "الحي", value: getValue("dis_nam") },
    { label: "الحالة", value: getStatusText(), colored: true },
    { label: "المساحة", value: `${getValue("area")} م²` },
    { label: "نوع المشروع", value: getValue("ACTIV") },
    { label: "النشاط الرئيسي", value: getValue("main_activ") },
    { label: "الإيجار", value: getRentText(), colored: true },
  ];

  // QR Code خاص بكل قطعة، يستخدم رقم القطعة كمفتاح
  const qrValue = getValue("number");

  return (
    <div className="absolute bottom-4 right-4 w-72 bg-gradient-to-r from-green-800 to-green-600 text-white p-4 rounded-xl shadow-lg border border-green-900 z-[9999]">
      <h2 className="font-bold text-lg border-b border-green-300 pb-2 text-center">
        بيانات قطعة الأرض
      </h2>

      {/* QR Code برقم القطعة فقط */}
      <div className="flex justify-center mt-3 mb-2">
        <QRCodeCanvas value={qrValue} size={120} bgColor="transparent" fgColor="#fff" level="H" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {infoItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-green-700/40 border border-green-400 rounded-lg px-2 py-1 flex justify-between items-center text-sm"
          >
            <span className="font-semibold">{item.label}</span>
            <span
              className={`${item.colored ? getStatusColor() : "text-white"} font-medium`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={exportToExcel}
        className="mt-4 w-full bg-white text-green-800 font-semibold py-2 rounded-lg hover:bg-green-100 transition"
      >
        تصدير إلى Excel
      </button>
    </div>
  );
};

export default LandInfoCard;
