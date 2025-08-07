import React from "react";



const FilterPanel = ({ filters, onFilterChange, onReset, neighborhoods }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-300 space-y-4">
      <h2 className="text-l font-bold text-green-900 mb-2 border-b pb-2 text-center">فرص الاراضي الاستثمار مدينة عرعر</h2>

      <div>
        <label className="text-l font-bold text-green-900 ">اسم الحي</label>
        <select
          value={filters.neighborhood}
          onChange={(e) => onFilterChange("neighborhood", e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md text-l"
        >
          <option value="">الكل</option>
          {neighborhoods.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-l font-bold text-green-900">حالة الاستثمار</label>
        <select
          value={filters.investmentStatus}
          onChange={(e) => onFilterChange("investmentStatus", e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md text-l"
        >
          <option value="">الكل</option>
          <option value="مستثمر">مستثمر</option>
          <option value="غير مستثمر">غير مستثمر</option>
          <option value="تحت الإيجار">تحت الإيجار</option>
        </select>
      </div>

      <div>
        <label className="text-l font-bold text-green-900">نوع المشروع</label>
        <select
          value={filters.projectType}
          onChange={(e) => onFilterChange("projectType", e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md text-l"
        >
          <option value="">الكل</option>
          <option value="كبرى">كبرى</option>
          <option value="متوسطة">متوسطة</option>
          <option value="ناشئة">ناشئة</option>
          <option value="مشاريع الخصخصة">مشاريع الخصخصة</option>
        </select>
      </div>

      <div>
        <label className="text-l font-bold text-green-900">المساحة من (م²)</label>
        <input
          type="number"
          placeholder="أقل مساحة"
          value={filters.minArea}
          onChange={(e) => onFilterChange("minArea", e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md text-l"
          min={0}
        />
      </div>

      <div>
        <label className="text-l font-bold text-green-900">المساحة إلى (م²)</label>
        <input
          type="number"
          placeholder="أعلى مساحة"
          value={filters.maxArea}
          onChange={(e) => onFilterChange("maxArea", e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md text-l"
          min={0}
        />
      </div>

      <button
        onClick={onReset}
        className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-md mt-2 transition"
      >
        تفريغ البيانات
      </button>
    </div>
  );
};

export default FilterPanel;
