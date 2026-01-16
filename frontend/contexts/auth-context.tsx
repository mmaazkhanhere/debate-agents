"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { z } from 'zod';

interface User {
    id: string;
    email: string;
    username: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Input validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(128);
const usernameSchema = z.string().trim().min(2, { message: "Username must be at least 2 characters" }).max(50);

// Session key for localStorage (no sensitive data stored)
const SESSION_KEY = 'arena_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(SESSION_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.id && parsed.email && parsed.username) {
                        setUser(parsed);
                    } else {
                        localStorage.removeItem(SESSION_KEY);
                    }
                } catch {
                    localStorage.removeItem(SESSION_KEY);
                }
            }
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Validate inputs
        const emailResult = emailSchema.safeParse(email);
        if (!emailResult.success) {
            return { success: false, error: emailResult.error.issues[0].message };
        }

        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
            return { success: false, error: passwordResult.error.issues[0].message };
        }

        // Demo mode: Accept any valid email/password combination
        // NOTE: This is demo-only functionality without real authentication
        // In production, this would validate against a secure backend
        const userData: User = {
            id: typeof crypto !== "undefined"
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2),
            email: emailResult.data,
            username: emailResult.data.split('@')[0],
            avatar: '🎭',
        };
        setUser(userData);
        // Store session (no passwords stored)
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true };
    }, []);

    const signUp = useCallback(async (email: string, password: string, username: string) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Validate inputs
        const emailResult = emailSchema.safeParse(email);
        if (!emailResult.success) {
            return { success: false, error: emailResult.error.issues[0].message };
        }

        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
            return { success: false, error: passwordResult.error.issues[0].message };
        }

        const usernameResult = usernameSchema.safeParse(username);
        if (!usernameResult.success) {
            return { success: false, error: usernameResult.error.issues[0].message };
        }

        // Demo mode: Accept any valid signup
        // NOTE: This is demo-only functionality without real authentication
        const userData: User = {
            id: crypto.randomUUID(),
            email: emailResult.data,
            username: usernameResult.data,
            avatar: '🎭',
        };
        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true };
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            signIn,
            signUp,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
