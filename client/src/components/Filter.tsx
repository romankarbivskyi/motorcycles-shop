import { ChangeEvent, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.ts";

interface FilterProps {
  onFilterChange: (filters: {
    price: { min: number; max: number };
    year: { min: number; max: number };
  }) => void;
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
}

export default function Filter({
  onFilterChange,
  priceRange,
  yearRange,
}: FilterProps) {
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);
  const [tempYearRange, setTempYearRange] = useState(yearRange);

  const debouncedPriceRange = useDebounce({
    value: tempPriceRange,
    delay: 500,
  });
  const debouncedYearRange = useDebounce({ value: tempYearRange, delay: 500 });

  useEffect(() => {
    onFilterChange({
      price: debouncedPriceRange,
      year: debouncedYearRange,
    });
  }, [debouncedPriceRange, debouncedYearRange, onFilterChange]);

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    setTempPriceRange((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    setTempYearRange((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <div className="filter-component">
      <h3 className="font-medium">Фільтри</h3>

      <div className="filter-item">
        <label>Ціна</label>
        <div className="flex justify-between">
          <span>{tempPriceRange.min}</span>
          <span>{tempPriceRange.max}</span>
        </div>
        <input
          type="range"
          name="min"
          min="0"
          max={tempPriceRange.max}
          value={tempPriceRange.min}
          onChange={handlePriceChange}
          className="w-full"
        />
        <input
          type="range"
          name="max"
          min={tempPriceRange.min}
          max="1000000"
          value={tempPriceRange.max}
          onChange={handlePriceChange}
          className="w-full"
        />
      </div>

      <div className="filter-item">
        <label>Рік</label>
        <div className="flex justify-between">
          <span>{tempYearRange.min}</span>
          <span>{tempYearRange.max}</span>
        </div>
        <input
          type="range"
          name="min"
          min="1900"
          max={tempYearRange.max}
          value={tempYearRange.min}
          onChange={handleYearChange}
          className="w-full"
        />
        <input
          type="range"
          name="max"
          min={tempYearRange.min}
          max={new Date().getFullYear()}
          value={tempYearRange.max}
          onChange={handleYearChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
