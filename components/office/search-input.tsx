"use client";

import { Search, X } from "lucide-react";
import React from "react";

interface SearchInputProps {
  children?: React.ReactNode;
  value?: string;
  className?: string;
}

const SearchInput = ({ children, value, className }: SearchInputProps) => {
  const [inputValue, setInputValue] = React.useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleDelete = (e: any) => {
    e.preventDefault();
    setInputValue("");
  };

  return (
    <>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          id="search"
          className="block w-full rounded-lg border p-2 ps-10 text-sm hover:border-primary focus-visible:border focus-visible:border-primary focus-visible:outline-none"
          placeholder="Search in Customers ( / )"
          autoComplete="off"
          onChange={handleInputChange}
          value={value || inputValue}
        />
        {inputValue && (
          <button
            type="button"
            className="absolute inset-y-0 end-0 flex items-center pe-3"
            onClick={handleDelete}
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
};

export default SearchInput;
