import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 - Page Not Found",
    description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-950 overflow-hidden text-zinc-50 font-sans">
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#d4a76a]/5 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4 text-center">
                <header className="space-y-2">
                    <h1 className="text-8xl font-black tracking-tighter text-zinc-800 animate-pulse">404</h1>
                    <h2 className="text-4xl font-bold text-[#d4a76a] tracking-tight">Lost in the Matrix?</h2>
                </header>

                <p className="text-zinc-500 max-w-sm text-lg">
                    The page you're searching for seems to have vanished or never existed in this dimension.
                </p>

                <Link href="/" prefetch={true}>
                    <Button
                        variant="outline"
                        className="border-[#d4a76a]/50 text-[#d4a76a] hover:bg-[#d4a76a]/10 px-8 h-12 text-lg rounded-xl transition-all hover:scale-105 cursor-pointer"
                    >
                        Return to Safety
                    </Button>
                </Link>
            </main>
        </div>
    );
}
