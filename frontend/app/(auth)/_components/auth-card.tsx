'use client';

import { useState } from 'react';
import AuthToggle from './auth-toggle';
import AuthForm from './auth-form';

export type AuthMode = 'signin' | 'signup';

const AuthCard = () => {
    const [mode, setMode] = useState<AuthMode>('signin');

    return (
        <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 md:p-8">
            <AuthToggle mode={mode} onChange={setMode} />
            <AuthForm mode={mode} />
        </div>
    );
}

export default AuthCard;
