import React from "react";
import type { IconProps } from "./icon";

const ChevronUp = (props: IconProps) => (
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
      d="M7.776 5.553a.5.5 0 0 1 .448 0l6 3a.5.5 0 1 1-.448.894L8 6.56 2.224 9.447a.5.5 0 1 1-.448-.894l6-3z"
    />
  </svg>
);

export default ChevronUp;
