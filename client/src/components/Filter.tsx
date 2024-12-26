import { ChangeEvent } from "react";

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
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    onFilterChange({
      price: {
        ...priceRange,
        [name]: newValue,
      },
      year: yearRange,
    });
  };

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    onFilterChange({
      price: priceRange,
      year: {
        ...yearRange,
        [name]: newValue,
      },
    });
  };

  return (
    <div className="filter-component">
      <h3 className="font-medium">Фільтри</h3>

      <div className="filter-item">
        <label>Ціна</label>
        <div className="flex justify-between">
          <span>{priceRange.min}</span>
          <span>{priceRange.max}</span>
        </div>
        <input
          type="range"
          name="min"
          min="0"
          max={priceRange.max}
          value={priceRange.min}
          onChange={handlePriceChange}
          className="w-full"
        />
        <input
          type="range"
          name="max"
          min={priceRange.min}
          max="1000000"
          value={priceRange.max}
          onChange={handlePriceChange}
          className="w-full"
        />
      </div>

      <div className="filter-item">
        <label>Рік</label>
        <div className="flex justify-between">
          <span>{yearRange.min}</span>
          <span>{yearRange.max}</span>
        </div>
        <input
          type="range"
          name="min"
          min="1900"
          max={yearRange.max}
          value={yearRange.min}
          onChange={handleYearChange}
          className="w-full"
        />
        <input
          type="range"
          name="max"
          min={yearRange.min}
          max={new Date().getFullYear()}
          value={yearRange.max}
          onChange={handleYearChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
