'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated, logout as authLogout } from '@/app/lib/utils/auth';
import { APP_ROUTES } from '@/app/lib/constants';
import type { User } from '@/app/lib/types/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const userData = getUser();
                setUser(userData);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const logout = () => {
        authLogout();
        setUser(null);
        router.push(APP_ROUTES.LOGIN);
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        logout,
    };
}
