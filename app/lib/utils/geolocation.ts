/**
 * Geolocation utility functions
 * Handles browser geolocation API and reverse geocoding
 */

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface LocationResult {
    city?: string;
    state?: string;
    country?: string;
    formatted: string;
    coordinates: Coordinates;
}

/**
 * Get user's current coordinates using browser geolocation API
 */
export async function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                let errorMessage = "Failed to get location";

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied. Please enable location permissions.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out";
                        break;
                }

                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    });
}

/**
 * Reverse geocode coordinates to human-readable location
 * Uses Nominatim (OpenStreetMap) API - free and no API key required
 */
export async function reverseGeocode(
    coordinates: Coordinates
): Promise<LocationResult> {
    const { latitude, longitude } = coordinates;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
                headers: {
                    "User-Agent": "Along App", // Nominatim requires a user agent
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch location data");
        }

        const data = await response.json();
        const address = data.address || {};

        // Extract location components
        const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "";
        const state = address.state || "";
        const country = address.country || "";

        // Format location string
        let formatted = "";
        if (city && state) {
            formatted = `${city}, ${state}`;
        } else if (city && country) {
            formatted = `${city}, ${country}`;
        } else if (state && country) {
            formatted = `${state}, ${country}`;
        } else if (country) {
            formatted = country;
        } else {
            formatted = "Unknown Location";
        }

        return {
            city,
            state,
            country,
            formatted,
            coordinates,
        };
    } catch (error) {
        console.error("Reverse geocoding failed:", error);

        // Fallback to coordinates if geocoding fails
        return {
            formatted: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            coordinates,
        };
    }
}

/**
 * Get user's current location with formatted address
 * Combines getCurrentPosition and reverseGeocode
 */
export async function getCurrentLocation(): Promise<LocationResult> {
    const coordinates = await getCurrentPosition();
    const location = await reverseGeocode(coordinates);
    return location;
}

/**
 * Check if geolocation is available in the browser
 */
export function isGeolocationAvailable(): boolean {
    return "geolocation" in navigator;
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
    if (!isGeolocationAvailable()) {
        return false;
    }

    try {
        await getCurrentPosition();
        return true;
    } catch (error) {
        return false;
    }
}
