"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import Loading from "@/components/Loading";

interface Session {
    user?: {
        id?: string;
        username?: string;
        discriminator?: string;
        avatar?: string;
        email?: string;
    };
}

interface AuthContextType {
    session: Session | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
                headers: {
                    "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "6d0776bb83bc15ba87691997de49bc9d6f6179e3c88e2dd13cbbea365ff457d418678fc2c7d3d9b45dc970fc06860ae3b2ec53",
                },
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setSession(data);
                }
            }
        } catch (err) {
            console.error("Error fetching session:", err);
        } finally {
            setLoading(false);
        }
    };

  const login = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // ส่ง secret ผ่าน header
    fetch(`${apiUrl}/auth/discord`, {
    }).then(response => {
      if (response.ok) {
        window.location.href = `${apiUrl}/auth/discord`;
      }
    });
  };

    const logout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-Secret": process.env.NEXT_PUBLIC_API_KEY || "",
                },
            });
            setSession(null);
            toast.success("Logged out successfully");
        } catch (err) {
            console.error("Error logging out:", err);
            toast.error("Failed to logout");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={{ session, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
