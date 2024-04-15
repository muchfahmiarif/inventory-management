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
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          id="search"
          className="border text-sm rounded-lg block w-full ps-10 p-2 hover:border-primary focus-visible:outline-none focus-visible:border focus-visible:border-primary "
          placeholder="Search in Customers ( / )"
          autoComplete="off"
          onChange={handleInputChange}
          value={value || inputValue}
        />
        {inputValue && (
          <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-3" onClick={handleDelete}>
            <X size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
};

export default SearchInput;
