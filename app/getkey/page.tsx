"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from 'sonner';
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    LogOut,
    Copy,
    Key,
    ExternalLink,
    ShieldCheck,
    Clock,
    Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function GetKeyPage() {
    const { session, logout } = useAuth();
    const router = useRouter();
    const [verified, setVerified] = useState(false);
    const [key, setKey] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [expiredAt, setExpiredAt] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loadingKey, setLoadingKey] = useState(false);
    const toastShown = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const rawSearch = window.location.search.replace(/&nbsp;/g, " ");
            const urlParams = new URLSearchParams(rawSearch);
            const type = urlParams.get("type");
            const meg = urlParams.get("meg");

            if (type && meg && !toastShown.current) {
                toastShown.current = true;
                let toastType = type.toLowerCase();
                let message = decodeURIComponent(meg);
                message = message.replace(/&nbsp;/g, " ");

                // ลบ query params ออกจาก URL ทันทีก่อน trigger toast
                window.history.replaceState({}, "", window.location.pathname);

                // ให้ Toaster render เสร็จก่อน trigger toast
                setTimeout(() => {
                    if (toastType === "success") toast.success(message);
                    else if (toastType === "error") toast.error(message);
                    else toast.info(message);
                }, 100);
            }
        }
    }, []);

    useEffect(() => {
        if (!session) {
            router.replace("/");
        }
    }, [session, router]);

    useEffect(() => {
        if (!session?.user?.id) return;
        checkKey();
    }, [session]);

const checkKey = async () => {
    try {
        setLoadingKey(true);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chack-key?discord_id=${session?.user?.id}`,
            {
                credentials: "include",
                method: "GET",
                headers: {
                    "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "",
                },
            }
        );

        const data = await res.json();
        if (data.valid) {
            setKey(data.key);
        } else {
            setKey(null);
        }
    } catch (err) {
        console.error("Error checking key:", err);
    } finally {
        setLoadingKey(false);
    }
};

    useEffect(() => {
        if (!key) return;
        const fetchExpiredAt = async (key: string) => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expiredAt`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "" },
                    body: JSON.stringify({ key }),
                    credentials: "include",
                });
                const { expiredAt } = await res.json();
                setExpiredAt(expiredAt);
            } catch (err) {
                console.error("Error fetching expiration:", err);
            }
        };
        fetchExpiredAt(key);
    }, [key]);

    useEffect(() => {
        if (!expiredAt) return;
        const update = () => {
            const now = Date.now();
            const end = new Date(expiredAt).getTime();
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft("Expired");
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };
        update();
        const iv = setInterval(update, 1000);
        return () => clearInterval(iv);
    }, [expiredAt]);

    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            setVerified(true);
        }
    }, []);

    const handleCaptchaVerify = async (captchaToken: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-turnstile`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "" },
            body: JSON.stringify({ token: captchaToken }),
            credentials: "include",
        });
        const data = await res.json();

        setVerified(data.success);
    };

const generateEncryptedLink = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-token`, {
            method: "POST",
            credentials: "include",
            headers: { 
                "Content-Type": "application/json", 
                "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "" 
            },
        });
        const data = await res.json();

        if (!data.success) {
            toast.error("Failed to create token.");
            return;
        }

        // ✅ เปลี่ยน destination_url ให้ชี้ไปหน้า frontend
        const encRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encryptLink`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "" 
            },
            body: JSON.stringify({
                // ✅ ชี้ไปหน้า callback แทน API
                destination_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/lootlabs-callback?token=${data.token}&discord_id=${session?.user?.id}`,
            }),
            credentials: "include",
        });

        if (!encRes.ok) throw new Error("Encryption failed");

        const encData = await encRes.json();
        setToken(data.token);
        return encData.encryptedLink;
    } catch (err) {
        console.error(err);
        toast.error("An error occurred during encryption.");
        return null;
    }
};
    const handleLootLabsClick = async () => {
        toast.info("Redirecting to LootLabs...");
        const link = await generateEncryptedLink();
        if (link) {
            window.location.href = `https://lootdest.org/s?OEAFxRAD&data=${link}`;
        }
    };

const handleLinkvertiseClick = async () => {
    toast.info("Redirecting to Linkvertise...");
    const link = await generateEncryptedLink();
    if (link && token) {
        // ✅ เปลี่ยน callback URL ให้ชี้ไปหน้า frontend แทน API
        const callbackUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/linkvertise-callback?discord_id=${session?.user?.id}&token=${token}`;
        
        const final = `https://link-to.net/1162634/${Math.random() * 1000}/dynamic?r=${btoa(
            encodeURI(callbackUrl)
        )}`;
        
        window.location.href = final;
    }
};

    const copy = () => {
        if (key) {
            navigator.clipboard.writeText(key);
            toast.success("Copied to clipboard!");
        }
    };

    if (!session) {
        return <Loading />;
    }

    if (loadingKey) {
        return <Loading />;
    }

    const getAvatarUrl = () => {
        if (session.user?.avatar) {
            const isAnimated = session.user.avatar.startsWith("a_");
            const format = isAnimated ? "gif" : "webp";
            return `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.${format}`;
        }
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user?.discriminator || "0") % 5
            }.png`;
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-background/50 overflow-hidden text-zinc-50 font-sans selection:bg-[#d4a76a]/30">
            {/* User Info & Logout */}
            <nav className="absolute top-4 right-4 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800 shadow-xl">
                    <Avatar className="h-8 w-8 ring-2 ring-zinc-800">
                        <AvatarImage src={getAvatarUrl()} alt={session.user?.username || "User avatar"} />
                        <AvatarFallback>{session.user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                        <Label className="text-sm font-medium text-zinc-200">
                            {session.user?.username}
                        </Label>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={logout}
                    className="rounded-full w-12 h-12 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                    <Label className="sr-only">Logout</Label>
                </Button>
            </nav>

            {/* Main Content */}
            <section className="z-10 w-full max-w-md px-4 py-8 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <header className="text-center space-y-4">
                    <Label className="tracking-tight bg-clip-text text-transparent bg-linear-to-b from-neutral-800 via-[#d4a76a] to-[#d4a76a] text-4xl md:text-4xl lg:text-8xl font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10 py-6"
                        style={{
                            display: "inline-block",
                            verticalAlign: "top",
                            textDecoration: "inherit",
                            textWrap: "balance"
                        }}
                    >
                        IJON KEY
                    </Label>
                    <Card className="bg-zinc-900/30 border-dashed border-zinc-800 backdrop-blur-sm">
                        <CardContent className="p-4 text-sm text-zinc-400 space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-3 h-3 text-[#d4a76a]" /> <Label>Key resets every week</Label>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-[#d4a76a]" /> <Label>1 Checkpoint per 8 hours (stackable)</Label>
                            </div>
                        </CardContent>
                    </Card>
                </header>

                {/* Dynamic Card Area */}
                <article className="w-full">
                    <Card className="w-full border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        {/* Decorative gradient top border */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#d4a76a] via-[#d4a76a]/50 to-[#d4a76a] opacity-50" />

                        <CardContent className="p-6 pt-8 flex flex-col items-center space-y-6">
                            {key ? (
                                !verified ? (
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        <div className="w-full flex justify-center p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                                            <Turnstile
                                                siteKey="0x4AAAAAABOU1ZPskaa2l3MO"
                                                onSuccess={handleCaptchaVerify}
                                                options={{ theme: "dark" }}
                                            />
                                        </div>
                                        <Label className="text-zinc-500 text-sm">
                                            Verify to reveal your key
                                        </Label>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-6 text-center">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                                                Time Remaining
                                            </Label>
                                            <div className="text-xl font-mono text-zinc-300">
                                                {timeLeft ?? <Label className="animate-pulse">Calculating...</Label>}
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute -inset-0.5 bg-linear-to-r from-[#d4a76a] to-[#d4a76a]/50 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                                            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-lg break-all text-[#d4a76a]/70 shadow-inner select-all">
                                                {key}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Button
                                                onClick={copy}
                                                className="w-full gap-2 bg-[#d4a76a] text-zinc-950 hover:bg-[#d4a76a]/70 hover:text-white cursor-pointer transition-all active:scale-95"
                                            >
                                                <Copy className="w-4 h-4" /> Copy Key
                                            </Button>
                                            <Button
                                                onClick={() => setShowPopup(true)}
                                                variant="secondary"
                                                className="w-full gap-2 cursor-pointer transition-all active:scale-95"
                                            >
                                                <Plus className="w-4 h-4" /> Add Time
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ) : !verified ? (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="w-full flex justify-center p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                                        <Turnstile
                                            siteKey="0x4AAAAAABOU1ZPskaa2l3MO"
                                            onSuccess={handleCaptchaVerify}
                                            options={{ theme: "dark" }}
                                        />
                                    </div>
                                    <Label className="text-zinc-500 text-sm">
                                        Complete verification to continue
                                    </Label>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setShowPopup(true)}
                                    size="lg"
                                    className="w-full gap-2 text-lg h-14 bg-linear-to-r from-[#d4a76a] to-[#d4a76a]/50 hover:from-[#d4a76a] hover:to-[#d4a76a]/50 shadow-lg shadow-[#d4a76a]/20 cursor-pointer transition-all active:scale-95"
                                >
                                    <Key className="w-5 h-5" /> Get Key
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </article>

                {/* Footer */}
                <footer className="mt-6 flex justify-center items-center gap-2 text-xs">
                    <Label className="text-zinc-600">Powered by</Label>
                    <a
                        href="https://theijon.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 font-semibold hover:text-[#d4a76a] hover:underline transition-colors"
                    >
                        The iJon
                    </a>
                    <Label className="text-zinc-600">&copy; 2025</Label>
                </footer>
            </section>

            {/* Provider Selection Modal */}
            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="sm:max-w-106.25 border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#d4a76a] to-transparent opacity-50" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center font-bold">Select Provider</DialogTitle>
                        <DialogDescription className="text-center text-zinc-400">
                            Choose your preferred platform to generate a key
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Button
                            onClick={handleLootLabsClick}
                            className="w-full justify-start h-16 gap-4 bg-[#1a1a1a] hover:bg-[#252525] border border-zinc-800 group cursor-pointer transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#d4a76a]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <img
                                    src="https://creators.lootlabs.gg/assets/svg/logo.svg"
                                    alt="LootLabs"
                                    className="w-6 h-6"
                                />
                            </div>
                            <div className="flex flex-col items-start">
                                <Label className="font-bold text-lg text-zinc-200">LootLabs</Label>
                                <Label className="text-xs text-zinc-500">Highly Recommended</Label>
                            </div>
                            <ExternalLink className="w-5 h-5 ml-auto text-zinc-600 group-hover:text-[#d4a76a] transition-colors" />
                        </Button>

                        <Button
                            onClick={handleLinkvertiseClick}
                            className="w-full justify-start h-16 gap-4 bg-[#1a1a1a] hover:bg-[#252525] border border-zinc-800 group cursor-pointer transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#d4a76a]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <img
                                    src="https://linkvertise.com/favicon-96x96.png"
                                    alt="Linkvertise"
                                    className="w-6 h-6 rounded-full"
                                />
                            </div>
                            <div className="flex flex-col items-start">
                                <Label className="font-bold text-lg text-zinc-200">Linkvertise</Label>
                                <Label className="text-xs text-zinc-500">Fast Alternative</Label>
                            </div>
                            <ExternalLink className="w-5 h-5 ml-auto text-zinc-600 group-hover:text-[#d4a76a] transition-colors" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
