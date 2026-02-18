import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import type { DebateConfig } from '@/types/debate-selection';
import { startDebate } from '@/actions/debate-api';
import { useClientSessionId } from '@/hooks/useClientSessionId';
import { useAuth } from '@/contexts/auth-context';

export const useDebateNavigation = () => {
    const router = useRouter();
    const sessionId = useClientSessionId();
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const startDebateNavigation = useCallback(async (config: DebateConfig) => {
        if (!sessionId) return;
        sessionStorage.setItem('debate_config', JSON.stringify(config));
        const debateId = await startDebate(
            config.topic.title,
            config.debater1.name,
            config.debater2.name,
            sessionId,
            userId
        );
        router.push(`/debate/${debateId}`);
    }, [router, sessionId, userId]);

    return { startDebate: startDebateNavigation };
}
