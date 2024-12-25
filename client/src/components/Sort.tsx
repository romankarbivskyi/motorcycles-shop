import { ChangeEvent } from "react";

interface SortSelectProps {
  title: string;
  options: { key: string; name: string }[];
  selectedOption: string;
  onChange: (value: string) => void;
}

export default function SortSelect({
  title,
  options,
  selectedOption,
  onChange,
}: SortSelectProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange(value);
  };

  return (
    <div className="sort-component">
      <label className="text-black font-medium mb-2">{title}</label>
      <select
        value={selectedOption}
        onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-2 w-full"
      >
        <option value="" disabled>
          Вибрати
        </option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
