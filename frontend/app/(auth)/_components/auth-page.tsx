'use client';

import AuthBackground from './auth-background';
import AuthCard from './auth-card';
import AuthLogo from './auth-logo';

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            <AuthBackground />

            <div className="w-full max-w-md">
                <AuthLogo />
                <AuthCard />
            </div>
        </div>
    );
}
