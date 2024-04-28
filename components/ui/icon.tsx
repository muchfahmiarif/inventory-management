import Image from "next/image";
import React, { ReactSVGElement } from "react";

interface IconProps {
  name: string;
  width?: number;
  height?: number;
  className?: string;
}

const Icon = ({ name, width = 100, height = 100, className }: IconProps) => {
  return <Image className={className} src={`/icons/${name}.svg`} alt={name} width={width} height={height} />;
};

export default Icon;
