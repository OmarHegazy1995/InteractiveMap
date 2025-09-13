import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ScannedPlotPage({ plot }) {
  const navigate = useNavigate();
  const contentRef = useRef();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  if (!plot) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-semibold text-green-900 mb-6 text-center">
          لا توجد بيانات لعرضها
        </h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-green-900 text-white rounded-lg shadow hover:bg-green-800 transition"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const getStatusText = () => {
    const status = plot.status;
    if (status === "مستثمر" || status === true) return "مستثمرة";
    if (status === "قيد الطرح") return "قيد الطرح";
    if (status === "تحت الإيجار") return "تحت الإيجار";
    return "غير مستثمرة";
  };

  const getStatusColor = () => {
    const statusText = getStatusText();
    if (statusText === "مستثمرة") return "border-red-500";
    if (statusText === "قيد الطرح") return "border-yellow-500";
    if (statusText === "تحت الإيجار") return "border-orange-500";
    return "border-green-500";
  };

  const infoItems = [
    { label: "رقم القطعة", value: plot.number },
    { label: "رقم المخطط", value: plot.planNumber },
    { label: "الحي", value: plot.neighborhood },
    { label: "الحالة", value: getStatusText(), colored: true },
    { label: "المساحة (م²)", value: plot.area },
    { label: "نوع المشروع", value: plot.ACTIV || plot.projectType },
    { label: "النشاط الرئيسي", value: plot.main_activ || plot.facilityType },
    { label: "الإيجار", value: plot.invested ? "مؤجر" : "غير مؤجر", colored: true },
    {
      label: "الإحداثيات",
      value: plot.coordinates
        ? plot.coordinates.map(([lat, lng]) => `(${lat.toFixed(4)}, ${lng.toFixed(4)})`).join(", ")
        : "غير متوفرة",
    },
  ];

  const qrValue = plot.number;

  const MAPBOX_TOKEN =
    "pk.eyJ1Ijoib21hci1oZWdhenkxMjMiLCJhIjoiY21mMHV1OTIyMGtxNjJrc2Jrc3ptd3hyeSJ9.0DL-T3mWdUhrcfOaRKenNA";
  const plotImage = plot.coordinates
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${plot.coordinates[0][1]},${plot.coordinates[0][0]},17,0/600x400?access_token=${MAPBOX_TOKEN}`
    : "/default-plot-image.jpg";

  const exportPDF = async () => {
    if (!imgLoaded) return alert("الرجاء الانتظار حتى تحميل الصورة");

    const element = contentRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    let renderWidth = pdfWidth;
    let renderHeight = pdfWidth / imgRatio;

    if (renderHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = pdfHeight * imgRatio;
    }

    const x = (pdfWidth - renderWidth) / 2;
    const y = 10;
    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
    pdf.save(`land-${plot.number}.pdf`);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100 p-2 md:p-4 overflow-y-auto">
      {/* Spinner تحميل */}
      {!imgLoaded && (
        <div className="absolute flex items-center justify-center inset-0 bg-gray-100/80 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-700"></div>
        </div>
      )}

      {/* Overlay لتكبير الصورة */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out overflow-auto p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={plotImage}
            alt="صورة مكبرة"
            className="max-h-[95%] max-w-[95%] object-contain rounded-lg shadow-lg animate-scaleIn"
          />
        </div>
      )}

      <div
        ref={contentRef}
        className={`w-full max-w-4xl bg-white rounded-2xl shadow-xl p-3 md:p-6 flex flex-col justify-between transition-all duration-300 ${
          !imgLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="text-xl md:text-2xl font-bold text-green-900 border-b pb-2 text-center">
          بيانات قطعة الأرض
        </h2>

        <div className="flex flex-col md:flex-row gap-3 md:gap-6 mt-3 md:mt-4">
          <div className="flex justify-center md:justify-start mb-3 md:mb-0">
            <QRCodeCanvas
              value={qrValue}
              size={70} // أصغر على الموبايل
              bgColor="transparent"
              fgColor="#14532d"
              level="H"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            {infoItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3 flex flex-col shadow-sm break-words"
              >
                <span className="text-xs md:text-sm font-semibold text-green-700">{item.label}</span>
                <span
                  className={`${item.colored ? getStatusColor() : "text-gray-900"} mt-1 font-medium text-xs md:text-sm`}
                >
                  {item.value}
                </span>
              </div>
            ))}

            <div
              className={`col-span-1 row-span-1 border-4 ${getStatusColor()} rounded-lg shadow-lg overflow-hidden cursor-zoom-in transition-transform duration-300 hover:scale-105`}
              onClick={() => setZoomed(true)}
            >
              <img
                src={plotImage}
                alt="صورة قطعة الأرض"
                crossOrigin="anonymous"
                onLoad={() => setImgLoaded(true)}
                className="w-full h-48 sm:h-60 md:h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex mt-3 md:mt-4 flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 sm:px-5 sm:py-2 bg-green-900 text-white rounded-lg shadow hover:bg-green-800 transition text-sm md:text-base"
          >
            العودة للرئيسية
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 sm:px-5 sm:py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition text-sm md:text-base"
          >
            تصدير PDF
          </button>
        </div>
      </div>

      {/* أنيميشن تكبير الصورة */}
      <style>
        {`
          @keyframes scaleIn {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.5s ease-in forwards;
          }
        `}
      </style>
    </div>
  );
}
