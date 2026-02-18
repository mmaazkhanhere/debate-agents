"use client";

import { useEffect, useState } from "react";
import { getOrCreateSessionId } from "@/lib/session-id";

export const useClientSessionId = (): string | null => {
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        setSessionId(getOrCreateSessionId());
    }, []);

    return sessionId;
};
