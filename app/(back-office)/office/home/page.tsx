"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const HomePage = () => {
  const { push } = useRouter();

  useEffect(() => {
    push("/office/home/inventory-dashboard");
  }, [push]);
  return <div></div>;
};

export default HomePage;
