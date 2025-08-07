import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



const LandInfoCard = ({ selectedLand, isInsideFilter, isBelowMap }) => {
  if (!selectedLand) return null;

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet([selectedLand]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Land Info");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "land-info.xlsx");
  };

  // إعداد حسب مكان العرض
  let baseClasses = "bg-gradient-to-r from-green-800 to-green-600 text-white p-4 rounded-xl shadow-lg border border-green-900";

  if (isInsideFilter) {
   
    baseClasses += " mt-4 w-full relative";
  } else if (isBelowMap) {
    
    baseClasses += " mt-4 w-full max-w-full rounded-xl";
  } else {
   
    baseClasses += " fixed bottom-6 right-6 w-64";
  }

  return (
    <div className={baseClasses}>
      <h2 className="font-bold text-lg mx-5   border-b border-green-300 pb-1 text-center">
        بيانات قطعة الأرض
      </h2>
      <p className="mb-1">
        <span className="font-semibold">رقم القطعة:</span> {selectedLand.number}
      </p>
      <p className="mb-1">
        <span className="font-semibold">الحالة:</span>{" "}
        {selectedLand.invested ? (
          <span className="text-red-400">مستثمرة</span>
        ) : (
          <span className="text-green-300">غير مستثمرة</span>
        )}
      </p>
      <p className="mb-1">
        <span className="font-semibold">المساحة:</span> {selectedLand.area} م²
      </p>
      <p className="mb-1">
        <span className="font-semibold">السعر:</span>{" "}
        {selectedLand.price
          ? `${selectedLand.price.toLocaleString()} ريال`
          : "غير محدد"}
      </p>
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
