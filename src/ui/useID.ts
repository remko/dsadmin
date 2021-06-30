import React from "react";

let uniqueID = 0;
export const newID = () => `id${uniqueID++}`;

function useID() {
  const idRef = React.useRef<string>();
  if (idRef.current === undefined) {
    idRef.current = newID();
  }
  return idRef.current;
}

export default useID;
