// app/debate/select/components/Header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, Swords } from 'lucide-react';


const Header = () => {
    const { user, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Swords className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary display-text tracking-wider">
                            THE ARENA
                        </h1>
                        <p className="text-xs text-muted-foreground">Choose your warriors</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-foreground">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header