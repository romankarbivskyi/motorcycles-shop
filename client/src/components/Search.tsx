import { useState } from "react";

interface SearchProps {
  onSubmit: (searchString: string) => void;
}

export default function Search({ onSubmit }: SearchProps) {
  const [search, setSearch] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onSubmit(search);
      }}
      className="relative w-full max-w-md mx-auto"
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Пошук..."
        className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="border border-black absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded hover:bg-gray-600/10 focus:outline-none"
      >
        Пошук
      </button>
    </form>
  );
}
