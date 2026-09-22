"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export function AutoRefresh({ ms = 30_000 }: { ms?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Skip the timed refresh while the tab is hidden; the listener below
    // refreshes when the user comes back.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, ms);

    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, ms]);

  return null;
}