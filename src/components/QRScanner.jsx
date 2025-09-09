import React, { useState } from "react";

const QRScannerFallback = ({ onScan }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input.trim());
      setInput("");
    }
  };

  return (
    <div className="p-2 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="ادخل رقم قطعة الأرض"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-1 rounded flex-1"
        />
        <button type="submit" className="bg-green-900 text-white px-3 rounded">
          بحث
        </button>
      </form>
    </div>
  );
};

export default QRScannerFallback;
