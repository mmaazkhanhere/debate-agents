import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import type { DebateConfig } from '@/app/select/_types/type';

export const useDebateNavigation = () => {
    const router = useRouter();

    const startDebate = useCallback((config: DebateConfig) => {
        sessionStorage.setItem('debate_config', JSON.stringify(config));
        router.push('/debate');
    }, [router]);

    return { startDebate };
}
