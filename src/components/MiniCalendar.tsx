import React from 'react';

export const MiniCalendar: React.FC = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDate = today.getDate();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/80">
        <span className="text-xs font-semibold text-neutral-200">
          {currentYear}년 {currentMonth + 1}월
        </span>
        <span className="text-[11px] text-neutral-400 font-mono">
          오늘: {currentDate}일
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {daysOfWeek.map((day, idx) => (
          <span
            key={day}
            className={`font-medium py-1 text-[11px] ${
              idx === 0 ? 'text-red-400' : idx === 6 ? 'text-sky-400' : 'text-neutral-500'
            }`}
          >
            {day}
          </span>
        ))}

        {blanks.map((b) => (
          <div key={`blank-${b}`} className="py-1" />
        ))}

        {days.map((day) => {
          const isToday = day === currentDate;
          return (
            <div
              key={day}
              className={`py-1 rounded font-mono tabular-nums text-xs ${
                isToday
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
