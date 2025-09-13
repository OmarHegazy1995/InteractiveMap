import React from "react";

export default function LoginPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden">
      {/* خلفية */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/InteractiveMap/22.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover", // بدل 100% 100% عشان ما تتشوهش
        }}
      ></div>

      {/* المحتوى */}
      <div className="relative z-10 w-full max-w-5xl bg-white/50 rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        
        {/* الشعارات - موبايل */}
        <div className="flex md:hidden flex-wrap justify-center gap-4 mb-6">
          <img src="/InteractiveMap/2.png" alt="أمانة الحدود الشمالية" className="w-1/3 max-w-[100px] object-contain" />
          <img src="/InteractiveMap/3.png" alt="لوجو راية" className="w-1/4 max-w-[90px] object-contain" />
          <img src="/InteractiveMap/4.png" alt="لوجو فرصة" className="w-1/4 max-w-[90px] object-contain" />
          <img src="/InteractiveMap/5.png" alt="لوجو وزارة الإسكان" className="w-1/4 max-w-[90px] object-contain" />
        </div>

        {/* الشعارات - شاشات كبيرة */}
        <div className="hidden md:flex flex-wrap md:flex-row md:gap-12 flex-1 items-center justify-center">
          <img src="/InteractiveMap/2.png" alt="أمانة الحدود الشمالية" className="h-28 object-contain" />
          <img src="/InteractiveMap/4.png" alt="لوجو راية" className="h-20 object-contain" />
          <img src="/InteractiveMap/3.png" alt="لوجو فرصة" className="h-20 object-contain" />
          <img src="/InteractiveMap/5.png" alt="لوجو وزارة الإسكان" className="h-20 object-contain" />
        </div>

        {/* خريطة وزر الدخول */}
        <div className="flex flex-col md:flex-1 items-center justify-center w-full max-w-md">
          <img src="/InteractiveMap/map.png" alt="صورة الخريطة" className="w-full h-auto max-h-64 object-contain mb-4" />
          <img src="/InteractiveMap/1.png" alt="لوجو الاستشاري" className="w-2/3 max-w-[150px] object-contain mb-6" />

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
