import React from "react";
import type { Error as APIError } from "../api";

export default function Error({ error }: { error: APIError | string }) {
  return (
    <div className="alert alert-danger">
      {typeof error === "string" ? error : error.message}
    </div>
  );
}
