import React from "react";
import classNames from "classnames";

const Loading = ({
  small = false,
  className,
}: {
  small?: boolean;
  className?: string;
}) => (
  <div
    className={classNames(
      "spinner-border",
      small ? "spinner-border-sm" : "m-3",
      className,
    )}
    role="status"
  >
    <span className="visually-hidden">Loading...</span>
  </div>
);

export default Loading;
