/**
 * Service Worker Registration Utilities
 * Handles registration, updates, and lifecycle management of service workers
 */

export interface SwRegistrationResult {
    success: boolean;
    registration?: ServiceWorkerRegistration;
    error?: Error;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<SwRegistrationResult> {
    if (typeof window === 'undefined') {
        return { success: false, error: new Error('Not in browser environment') };
    }

    if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers are not supported in this browser');
        return {
            success: false,
            error: new Error('Service Workers not supported'),
        };
    }

    try {
        // Wait for the page to be fully loaded before registering
        if (document.readyState !== 'complete') {
            await new Promise((resolve) => {
                window.addEventListener('load', resolve);
            });
        }

        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        const currentRegistration = existingRegistrations.find((registration) =>
            registration.scope === window.location.origin + '/',
        );

        if (currentRegistration) {
            await currentRegistration.update();
            return { success: true, registration: currentRegistration };
        }

        // Register new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        });

        console.log('Service Worker registered successfully:', registration);

        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New service worker available');
                    sessionStorage.setItem('sw-update-available', 'true');
                }
            });
        });

        return { success: true, registration };
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return { success: false, error: error as Error };
    }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('serviceWorker' in navigator)) return false;

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const unregisterPromises = registrations.map((registration) =>
            registration.unregister()
        );
        await Promise.all(unregisterPromises);
        console.log('All service workers unregistered');
        return true;
    } catch (error) {
        console.error('Failed to unregister service workers:', error);
        return false;
    }
}

/**
 * Check if service worker is registered and active
 */
export function isServiceWorkerActive(): boolean {
    if (typeof window === 'undefined') return false;
    if (!('serviceWorker' in navigator)) return false;

    return !!navigator.serviceWorker.controller;
}

/**
 * Send a message to the active service worker
 */
export async function sendMessageToSW(message: unknown): Promise<unknown> {
    if (!navigator.serviceWorker.controller) {
        throw new Error('No active service worker');
    }

    return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };

        navigator.serviceWorker.controller?.postMessage(message, [
            messageChannel.port2,
        ]);
    });
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('caches' in window)) return false;

    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        console.log('All caches cleared');
        return true;
    } catch (error) {
        console.error('Failed to clear caches:', error);
        return false;
    }
}
