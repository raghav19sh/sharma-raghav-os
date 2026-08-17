"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form action={formAction} className="w-full max-w-sm bg-surface border border-border rounded-card p-7 flex flex-col gap-4">
        <div>
          <div className="w-9 h-9 rounded-[10px] bg-burgundy text-on-lavender font-bold text-sm flex items-center justify-center mb-3">SR</div>
          <h1 className="text-[18px] font-semibold text-text-1">Admin OS</h1>
          <p className="text-[13px] text-text-2 mt-1">This is not part of the public experience. Sign in with the authorized admin account.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-text-1">Email</span>
          <input name="email" type="email" required autoComplete="username" className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] text-text-1" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-text-1">Password</span>
          <input name="password" type="password" required autoComplete="current-password" minLength={8} className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] text-text-1" />
        </label>

        {state?.error && (
          <div className="text-[12.5px] text-status-red-text bg-status-red-tint rounded-lg px-3 py-2">{state.error}</div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-lavender text-on-lavender text-[14px] font-medium py-2.5 rounded-btn disabled:opacity-60">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
