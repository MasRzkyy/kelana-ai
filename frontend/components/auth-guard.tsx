"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getMe, logoutUser } from "@/services/auth-service";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const user = await getMe();
      if (!user) {
        logoutUser();
        router.push("/login");
        return;
      }

      setIsAuthorized(true);
    }

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f0eee6] flex items-center justify-center font-[family-name:var(--font-outfit)]">
        <div className="flex items-center gap-3 bg-[#faf9f5] border border-[#cccbc8] px-6 py-4 rounded-2xl shadow-xs text-xs font-semibold text-[#141413]">
          <svg className="animate-spin h-4 w-4 text-[#d97757]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
