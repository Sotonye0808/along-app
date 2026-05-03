"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { AppInput } from "@/components/ui/AppInput";

export interface PlaceResult {
  label: string;
  lat: number;
  lng: number;
}

export interface PlaceAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Loads the Google Maps JavaScript API script (once per page).
 * Resolves when `window.google.maps` is ready.
 */
function loadGoogleMapsScript(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error("no_key"));

  if (typeof window !== "undefined" && window.google?.maps?.places) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      // Script already injected — wait for it
      const wait = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(wait);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load_failed"));
    document.head.appendChild(script);
  });
}

/**
 * PlaceAutocomplete — wraps Google Places Autocomplete on an AppInput.
 * Gracefully degrades to a plain text input when no API key is configured.
 */
export function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = "Search for a place…",
  value: externalValue,
  onChange,
  className,
  disabled,
}: PlaceAutocompleteProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [internalValue, setInternalValue] = useState(externalValue ?? "");
  const [available, setAvailable] = useState(false);

  const displayValue = externalValue !== undefined ? externalValue : internalValue;

  const handleChange = useCallback(
    (v: string) => {
      setInternalValue(v);
      onChange?.(v);
    },
    [onChange],
  );

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setAvailable(true))
      .catch(() => {
        /* No Google Maps API key — use plain text input */
      });
  }, []);

  useEffect(() => {
    if (!available || !inputRef.current) return;
    if (autocompleteRef.current) return; // already initialized

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;

      const result: PlaceResult = {
        label: place.formatted_address ?? place.name ?? "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      handleChange(result.label);
      onPlaceSelect(result);
    });

    autocompleteRef.current = ac;
  }, [available, handleChange, onPlaceSelect]);

  return (
    <div className={["relative", className ?? ""].join(" ").trim()}>
      <AppInput
        ref={inputRef as React.Ref<HTMLInputElement>}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        prefix={<MapPin size={14} className="text-[var(--color-text-secondary)]" />}
        disabled={disabled}
      />
      {!available && (
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 ml-1">
          Location autocomplete unavailable — type coordinates manually
        </p>
      )}
    </div>
  );
}
