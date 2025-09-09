import React from "react";

const FilterPanel = ({ filters, onFilterChange, onReset, neighborhoods }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* حي */}
      <select
        value={filters.neighborhood}
        onChange={(e) => onFilterChange("neighborhood", e.target.value)}
        className="h-8 text-sm rounded px-2"
      >
        <option value="">الحي</option>
        {neighborhoods.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {/* حالة الاستثمار */}
      <select
        value={filters.investmentStatus}
        onChange={(e) => onFilterChange("investmentStatus", e.target.value)}
        className="h-8 text-sm rounded px-2"
      >
        <option value="">حالة الاستثمار</option>
        <option value="مستثمر">مستثمر</option>
        <option value="غير مستثمر">غير مستثمر</option>
        <option value="قيد الطرح">قيد الطرح</option>
      </select>

      {/* نوع المشروع */}
      <select
        value={filters.projectType}
        onChange={(e) => onFilterChange("projectType", e.target.value)}
        className="h-8 text-sm rounded px-2"
      >
        <option value="">نوع المشروع</option>
        <option value="كبرى">كبرى</option>
        <option value="متوسطة">متوسطة</option>
        <option value="ناشئة">ناشئة</option>
        <option value="مشاريع الخصخصة">مشاريع الخصخصة</option>
      </select>

      {/* مساحة من */}
      <input
        type="number"
        placeholder="Min"
        value={filters.minArea}
        onChange={(e) => onFilterChange("minArea", e.target.value)}
        className="h-8 w-16 text-sm rounded px-2"
        min={0}
      />

      {/* مساحة إلى */}
      <input
        type="number"
        placeholder="Max"
        value={filters.maxArea}
        onChange={(e) => onFilterChange("maxArea", e.target.value)}
        className="h-8 w-16 text-sm rounded px-2"
        min={0}
      />

      {/* زر إعادة */}
      <button
        onClick={onReset}
        className="h-8 text-sm bg-white text-green-900 rounded px-2 font-semibold"
      >
        إعادة
      </button>
    </div>
  );
};

export default FilterPanel;
