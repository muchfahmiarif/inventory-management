import NavbarHomePage from "@/components/office/home/navbar";
import React from "react";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <div className="">
      <NavbarHomePage />
      {children}
    </div>
  );
};

export default HomeLayout;
