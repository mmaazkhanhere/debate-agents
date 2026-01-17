import { useEffect, useState } from "react";

export const useCountdown = (total: number, running: boolean, onDone?: () => void) => {
    const [remaining, setRemaining] = useState(total);

    useEffect(() => {
        if (!running) return;

        const start = Date.now();
        const end = start + total * 1000;

        const tick = () => {
            const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
            setRemaining(left);

            if (left === 0) onDone?.();
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [total, running, onDone]);

    return remaining;
}