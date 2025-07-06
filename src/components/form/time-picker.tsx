import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

type TimePickerProps = {
  id: string;
  value?: string;
  onChange?: (time: string) => void;
  label?: string;
  disabled?: boolean;
};

export default function TimePicker({ id, value, onChange, label, disabled }: TimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const fp = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      time_24hr: true,
      defaultDate: value,
      onChange: (selectedDates, dateStr) => {
        if (onChange) onChange(dateStr);
      },
    });
    return () => {
      fp.destroy();
    };
  }, [onChange, value]);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="w-full rounded border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          disabled={disabled}
          placeholder="HH:MM"
          autoComplete="off"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </span>
      </div>
    </div>
  );
}
