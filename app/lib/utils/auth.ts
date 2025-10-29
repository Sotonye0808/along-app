import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '@/app/lib/constants';
import type { User } from '@/app/lib/types/types';

/**
 * Set authentication tokens
 */
export function setAuthTokens(accessToken: string, refreshToken?: string): void {
    Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    if (refreshToken) {
        Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }
}

/**
 * Get access token
 */
export function getAccessToken(): string | undefined {
    return Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | undefined {
    return Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Remove authentication tokens
 */
export function removeAuthTokens(): void {
    Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

/**
 * Store user data in localStorage
 */
export function setUser(user: User): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }
}

/**
 * Logout user
 */
export function logout(): void {
    removeAuthTokens();
    removeUser();
}
