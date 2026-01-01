"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            // Redirect to backend callback endpoint with the code
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/callback?code=${code}`;
        } else {
            toast.error("Authentication failed: No authorization code provided.");
            const timer = setTimeout(() => {
                router.push("/");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [router]);

    return (
        <Loading />
    );
}
