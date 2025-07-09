import React, { useState } from "react";

const ChartTab: React.FC = () => {
  const [selected, setSelected] = useState<
    "optionOne" | "optionTwo" | "optionThree"
  >("optionOne");

  const getButtonClass = (option: "optionOne" | "optionTwo" | "optionThree") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => setSelected("optionOne")}
        className={`px-2 py-1 font-medium w-full rounded-md text-xs hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "optionOne"
        )}`}
      >
        Minggu
      </button>

      <button
        onClick={() => setSelected("optionTwo")}
        className={`px-2 py-1 font-medium w-full rounded-md text-xs hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "optionTwo"
        )}`}
      >
        Bulan
      </button>

      <button
        onClick={() => setSelected("optionThree")}
        className={`px-2 py-1 font-medium w-full rounded-md text-xs hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "optionThree"
        )}`}
      >
        Tahun
      </button>
    </div>
  );
};

export default ChartTab;
