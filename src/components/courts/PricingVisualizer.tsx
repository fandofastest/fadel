"use client";
import React from "react";

interface PricingVisualizerProps {
  rules: Array<{
    _id: string;
    startDayOfWeek: number;
    endDayOfWeek: number;
    startHour: number;
    endHour: number;
    rate: number;
  }>;
}

export default function PricingVisualizer({ rules }: PricingVisualizerProps) {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  
  // Find the min and max rate to create a color scale
  const rates = rules.map(rule => rule.rate);
  const minRate = Math.min(...(rates.length ? rates : [0]));
  const maxRate = Math.max(...(rates.length ? rates : [0]));
  const rateRange = maxRate - minRate;

  // Get the color intensity based on the rate
  const getColorClass = (rate: number) => {
    if (rates.length <= 1) return "bg-green-200 dark:bg-green-800";
    
    if (rate >= minRate + rateRange * 0.75) {
      return "bg-red-200 dark:bg-red-800";
    } else if (rate >= minRate + rateRange * 0.5) {
      return "bg-orange-200 dark:bg-orange-800";
    } else if (rate >= minRate + rateRange * 0.25) {
      return "bg-yellow-200 dark:bg-yellow-800";
    } else {
      return "bg-green-200 dark:bg-green-800";
    }
  };

  // Find rule for a specific day and hour
  const getRuleForTimeSlot = (dayIndex: number, hour: number) => {
    return rules.find(rule => 
      dayIndex >= rule.startDayOfWeek && 
      dayIndex <= rule.endDayOfWeek &&
      hour >= rule.startHour && 
      hour < rule.endHour
    );
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-100">Visualisasi Harga</h3>
        <div className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded mr-1"></div>
            <span>Rendah</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800 rounded mr-1"></div>
            <span>Sedang</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-200 dark:bg-orange-800 rounded mr-1"></div>
            <span>Tinggi</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-200 dark:bg-red-800 rounded mr-1"></div>
            <span>Puncak</span>
          </div>
        </div>
      </div>
      
      {/* Timeline hours header */}
      <div className="flex mb-1 pl-16">
        {[0, 6, 12, 18, 23].map((hour) => (
          <div 
            key={hour} 
            className="flex-1 text-xs text-gray-500 dark:text-gray-400"
            style={{ flexBasis: hour === 23 ? '4.16%' : '25%' }}
          >
            {hour}:00
          </div>
        ))}
      </div>
      
      {/* Day rows with time slots */}
      <div className="space-y-2">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="flex items-center">
            <div className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">{day}</div>
            <div className="flex flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              {Array.from({ length: 24 }, (_, hour) => {
                const rule = getRuleForTimeSlot(dayIndex, hour);
                
                return (
                  <div 
                    key={hour} 
                    className={`h-full ${rule ? getColorClass(rule.rate) : 'bg-gray-200 dark:bg-gray-600'}`}
                    style={{ width: '4.16%' }}
                    title={rule 
                      ? `${day}, ${hour}:00 - ${hour+1}:00, Rp${rule.rate.toLocaleString('id-ID')}` 
                      : `${day}, ${hour}:00 - ${hour+1}:00, Tidak ada tarif`
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hour markers */}
      <div className="flex pl-16 mt-1">
        {Array.from({ length: 13 }, (_, i) => i * 2).map((hour) => (
          <div 
            key={hour} 
            className="flex-1 text-xs text-gray-500 dark:text-gray-400 text-center"
            style={{ flexBasis: '8.33%' }}
          >
            {hour}
          </div>
        ))}
      </div>
    </div>
  );
}
