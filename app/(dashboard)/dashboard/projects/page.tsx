"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Redirect() {
  const router = useRouter();
  useEffect(function() { router.replace("/dashboard/projects/projects"); }, [router]);
  return null;
}
