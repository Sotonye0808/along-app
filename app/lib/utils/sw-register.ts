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

        // Unregister existing service workers first to prevent conflicts
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of existingRegistrations) {
            await registration.unregister();
            console.log('Unregistered existing service worker');
        }

        // Small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Register new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none', // Always fetch the latest sw.js
        });

        console.log('Service Worker registered successfully:', registration);

        // DISABLED: Automatic update checks cause excessive function calls
        // Service worker will update naturally on page reload
        // TODO: Consider manual update check on user action instead
        // Check for updates every hour
        // setInterval(() => {
        //     registration.update();
        // }, 60 * 60 * 1000);

        // Handle updates - ensure we only show prompt once per version
        let updatePromptShown = sessionStorage.getItem('sw-update-prompted') === 'true';
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (
                        newWorker.state === 'installed' &&
                        navigator.serviceWorker.controller &&
                        !updatePromptShown
                    ) {
                        // New service worker available, notify user once
                        updatePromptShown = true;
                        sessionStorage.setItem('sw-update-prompted', 'true');
                        console.log('New service worker available');

                        if (
                            confirm(
                                'A new version of Along is available. Reload to update?'
                            )
                        ) {
                            // Clear the flag before reloading so it doesn't persist
                            sessionStorage.removeItem('sw-update-prompted');
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            window.location.reload();
                        }
                    }
                });
            }
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
