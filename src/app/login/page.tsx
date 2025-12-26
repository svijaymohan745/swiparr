"use client";
import LoginContent from "@/components/login/LoginContent";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950 p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}