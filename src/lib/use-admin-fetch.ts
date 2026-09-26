"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAdminFetch() {
  const router = useRouter();

  return useCallback(
    async (input: string, init?: RequestInit) => {
      const res = await fetch(input, init);
      if (res.status === 401) {
        router.push("/admin/login");
        throw new Error("Unauthorized");
      }
      return res;
    },
    [router]
  );
}
