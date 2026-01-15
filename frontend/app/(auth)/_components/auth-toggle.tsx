'use client';

import { Button } from '@/components/ui/button';
import type { AuthMode } from './auth-card';

interface Props {
    mode: AuthMode;
    onChange: (mode: AuthMode) => void;
}

const AuthToggle = ({ mode, onChange }: Props) => {
    return (
        <div className="flex bg-secondary/50 rounded-lg p-1 mb-6">
            {(['signin', 'signup'] as const).map((value) => (
                <Button
                    key={value}
                    onClick={() => onChange(value)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all gap-4 ${mode === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                        }`}
                >
                    {value === 'signin' ? 'Sign In' : 'Sign Up'}
                </Button>
            ))}
        </div>
    );
}

export default AuthToggle;