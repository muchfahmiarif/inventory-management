import React from "react";

interface TextInputProps {
  type: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  htmlFor: string;
  name: string;
}

const TextInput = ({
  type,
  id,
  value,
  onChange,
  htmlFor,
  name,
}: TextInputProps) => {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className={`font-roboto tracking-body-large peer h-[40px] w-[360px] rounded-[4px] border-[1px] border-[#CAC4D0] bg-transparent px-2 text-base text-gray-900 focus:border-[#6750A4] focus:outline-none`}
        required
      />
      <label
        htmlFor={htmlFor}
        className={`absolute start-1 top-2 z-10 origin-[0] bg-white px-2 text-base text-[#49454F] duration-300 hover:cursor-text peer-focus:text-[#6750A4] ${
          value
            ? "top-[-0.25rem] -translate-y-2 scale-50"
            : "scale-75 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-[-0.25rem] peer-focus:-translate-y-2 peer-focus:scale-50"
        }`}
      >
        {name}
      </label>
    </div>
  );
};

export default TextInput;
