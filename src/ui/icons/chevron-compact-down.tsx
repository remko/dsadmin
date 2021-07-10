import React from "react";
import type { IconProps } from "./icon";

const ChevronDown = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67z"
    />
  </svg>
);

export default ChevronDown;
