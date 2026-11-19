"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import TextInput from "@/components/form/text-input";

type InputProps = {
  example: string;
  exampleRequired: string;
};

const NewItemPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputProps>();
  const onSubmit: SubmitHandler<InputProps> = (data) => console.log(data);

  console.log(watch("example")); // watch input value by passing the name of it

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-4">
        <h2 className="text-3xl">New Item</h2>
        <Button variant={"ghost"} size={"icon"} onClick={handleBack}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      {/* Body */}
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            type="text"
            id="example"
            htmlFor="example"
            name="Example"
            onChange={() => console.log("test")}
            value=""
          />
          <input
            className=""
            {...register("exampleRequired", { required: true })}
          />
          {errors.exampleRequired && <span>This field is required</span>}
          <input className="ring" type="submit" />
        </form>
      </div>
    </div>
  );
};

export default NewItemPage;
