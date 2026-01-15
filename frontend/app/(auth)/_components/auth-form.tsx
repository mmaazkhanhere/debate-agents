'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import type { AuthMode } from './auth-card';
import { useAuth } from '@/contexts/auth-context';
import { ArrowRight, Lock, Mail, Sparkles, User } from 'lucide-react';

interface Props {
    mode: AuthMode;
}

export default function AuthForm({ mode }: Props) {
    const router = useRouter();
    const { signIn, signUp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result =
            mode === 'signin'
                ? await signIn(email, password)
                : await signUp(email, password, username);

        setLoading(false);

        if (result.success) {
            router.push('/select');
            return;
        }

        setError(result.error ?? 'Authentication failed');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
                {mode === 'signup' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Label>Username</Label>

                        <div
                            className="mt-1 flex items-center gap-2 rounded-md border border-border/50 
                            bg-secondary/50 px-1 focus-within:ring-1 focus-within:ring-ring"
                        >
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />

                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="border-0 bg-transparent p-0 focus-visible:ring-0 
                                ocus-visible:ring-offset-0"
                                placeholder='DebateMaster2024'
                            />
                        </div>
                    </motion.div>

                )}
            </AnimatePresence>

            <Field
                label="Email"
                icon={<Mail />}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder='you@arena.tv'
            />

            <Field
                label="Password"
                icon={<Lock />}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
            />

            {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 py-2 rounded-lg">
                    {error}
                </div>
            )}

            <Button disabled={loading} className="w-full font-bold h-10">
                {loading ? (
                    <motion.div
                        className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                ) : (
                    <>
                        {mode === 'signin' ? 'Enter The Arena' : 'Join The Arena'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                )}
            </Button>


        </form>
    );
}

const Field = ({
    label,
    icon,
    type,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    icon: React.ReactNode;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <div
                className="
                    flex items-center gap-2 rounded-md bg-secondary/50 p-1 focus-within:ring-1
                    focus-within:ring-ring
                "
            >
                <span className="text-muted-foreground shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                    {icon}
                </span>


                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    placeholder={placeholder}
                    className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
        </div>
    );
};

