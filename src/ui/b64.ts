/// <reference types="node" />

export const b64decode =
  typeof atob === "undefined"
    ? function atob(v: string): string {
        return Buffer.from(v, "base64").toString();
      }
    : atob;

export const b64encode =
  typeof btoa === "undefined"
    ? function btoa(v: string): string {
        return Buffer.from(v).toString("base64");
      }
    : btoa;
