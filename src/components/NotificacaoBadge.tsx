"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function NotificacaoBadge() {
    const { data: session } = useSession();
    const [count, setCount] = useState(0);
    const role = (session?.user as any)?.role;

    useEffect(() => {
        if (!['TECNICO', 'MASTER', 'ADMIN'].includes(role)) return;

        const fetch_ = () => {
            fetch('/api/tecnico/notificacoes')
                .then(r => r.json())
                .then(d => setCount(d.novos || 0))
                .catch(() => {});
        };

        fetch_();
        const interval = setInterval(fetch_, 30000);
        return () => clearInterval(interval);
    }, [role]);

    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
            {count > 99 ? '99+' : count}
        </span>
    );
}