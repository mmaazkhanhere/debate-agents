"use client";

import { useEffect } from "react";
import { getOrCreateSessionId } from "@/lib/session-id";

const SessionBootstrap = () => {
    useEffect(() => {
        getOrCreateSessionId();
    }, []);

    return null;
};

export default SessionBootstrap;
