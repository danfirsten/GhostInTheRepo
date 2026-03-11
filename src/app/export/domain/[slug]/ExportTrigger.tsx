"use client";

import { useEffect } from "react";

export function ExportTrigger() {
  useEffect(() => {
    // Short delay to ensure rendering is complete
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
