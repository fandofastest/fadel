"use client";
import React, { useEffect, useState } from "react";

export function ClientOnlyNumber({ value }: { value: number }) {
  const [formatted, setFormatted] = useState(value.toString());
  useEffect(() => {
    setFormatted(value.toLocaleString("id-ID"));
  }, [value]);
  return <>{formatted}</>;
}
