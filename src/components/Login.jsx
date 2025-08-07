import React, { forwardRef } from "react";
export default function LoginPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden">
      {/* خلفية */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-100"
        style={{
          backgroundImage: "url('4.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          zIndex: 0,
        }}
      ></div>

      {/* المحتوى */}
      <div className="relative z-10 max-w-6xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-10">
        
        {/* الشعارات - موبايل */}
        <div className="flex md:hidden flex-wrap justify-center gap-4 mb-6">
          <img src="2.png" alt="أمانة الحدود الشمالية" className="w-32 object-contain" />
          <img src="3.png" alt="لوجو راية" className="w-28 object-contain" />
          <img src="4.png" alt="لوجو فرصة" className="w-28 object-contain" />
          <img src="5.png" alt="لوجو وزارة الإسكان" className="w-28 object-contain" />
        </div>

        {/* الشعارات - شاشات كبيرة */}
        <div className="hidden md:flex flex-col gap-8 md:flex-row md:gap-12 md:flex-1 items-center justify-center">
          <img src="2.png" alt="أمانة الحدود الشمالية" className="h-20 object-contain" />
          <img src="3.png" alt="لوجو راية" className="h-16 object-contain" />
          <img src="4.png" alt="لوجو فرصة" className="h-16 object-contain" />
          <img src="5.png" alt="لوجو وزارة الإسكان" className="h-16 object-contain" />
        </div>

        {/* خريطة وزر الدخول */}
        <div className="flex flex-col md:flex-1 items-center justify-between h-full max-w-md">
          <img src="map.png" alt="صورة الخريطة" className="w-full max-h-64 object-contain mb-4" />
          <img src="1.png" alt="لوجو الاستشاري" className="w-36 object-contain mb-6" />

          <button
            onClick={onEnter}
            className="w-full bg-green-800 hover:bg-green-900 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg"
          >
            دخول إلى الخريطة
          </button>
        </div>
      </div>
    </div>
  );
}
