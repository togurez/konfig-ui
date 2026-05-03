"use client";

/**
 * Fires the syncProfile mutation once per browser session after the Auth0
 * session is confirmed. Uses sessionStorage as a guard so it only runs once
 * per tab lifetime, even across client-side navigations.
 *
 * If syncProfile fails, renders a blocking error screen with a retry button.
 * Without a valid profile record the app cannot show names, enforce scopes,
 * or attribute audit actions correctly.
 */
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { apolloClient } from "@/lib/apollo";
import { SYNC_PROFILE } from "@/lib/api";

const STORAGE_KEY = "konfig_profile_synced";

export function ClientBootstrap() {
  const { user, isLoading } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (isLoading || !user) return;

    // Already synced this session.
    if (typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(STORAGE_KEY)) {
      return;
    }

    let cancelled = false;

    apolloClient
      .mutate({ mutation: SYNC_PROFILE })
      .then(() => {
        if (!cancelled) {
          sessionStorage.setItem(STORAGE_KEY, "1");
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => { cancelled = true; };
  }, [user, isLoading, retryKey]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg font-mono text-[13px]">
        <div className="max-w-md text-center space-y-4 px-6">
          <p className="text-red-400 font-semibold">Could not load your profile.</p>
          <p className="text-text-dim">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              setError(null);
              setRetryKey((k) => k + 1);
            }}
            className="px-4 py-2 border border-dashed border-line-2 rounded-[3px] text-text-dim hover:text-text transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}
