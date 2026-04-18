"use client";

import { useEffect } from "react";

export function NotificationAutoRefresh() {
  useEffect(() => {
    const timer = window.setInterval(() => {
      window.location.reload();
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
