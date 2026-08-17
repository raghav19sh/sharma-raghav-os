import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { SecurityTools } from "@/components/security/SecurityTools";

export const metadata: Metadata = { title: "Security Lab", description: "Interactive security tools that run entirely in your browser." };

export default function SecurityLabPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Shield size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Security Lab</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Interactive tools that run entirely in your browser. Nothing typed here is stored or transmitted.</p>
        </div>
      </div>
      <SecurityTools />
    </div>
  );
}
