import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.ts";

interface SearchProps {
  onSearch: (search: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce<string>({ value: search });

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Пошук..."
      className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
