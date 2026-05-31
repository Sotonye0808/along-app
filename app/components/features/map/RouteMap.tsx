"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clock, MapPin, Route } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";
import { AppTag } from "@/components/ui/AppTag";
import { AppSpinner } from "@/components/ui/AppSpinner";

// Defer heavy maplibre imports to client-side only
let Map: typeof import("react-map-gl/maplibre").default | null = null;
let Marker: typeof import("react-map-gl/maplibre").Marker | null = null;
let Source: typeof import("react-map-gl/maplibre").Source | null = null;
let Layer: typeof import("react-map-gl/maplibre").Layer | null = null;
let NavigationControl:
  | typeof import("react-map-gl/maplibre").NavigationControl
  | null = null;

const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAPTILER_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/liberty";

/** Default center: Lagos, Nigeria */
const DEFAULT_CENTER = { longitude: 3.3792, latitude: 6.5244 };

export interface RouteMapProps {
  post: Pick<
    Post,
    | "startLat"
    | "startLng"
    | "endLat"
    | "endLng"
    | "waypoints"
    | "totalDistanceKm"
    | "estimatedMins"
    | "region"
    | "title"
  >;
  /** Height of the map in px (default: 300) or "full" for parent-fill */
  height?: number | "full";
  className?: string;
  /** If true, wrap in a collapsible panel (mobile-friendly) */
  collapsible?: boolean;
  /** If true, enable map interactions (default: false) */
  interactive?: boolean;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

const HEIGHT_CLASS_MAP: Record<number, string> = {
  220: "h-[220px]",
  240: "h-[240px]",
  300: "h-[300px]",
};

interface RouteMapInnerProps {
  post: RouteMapProps["post"];
  className?: string;
  heightClassName: string;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getZoomForDistance(km: number): number {
  if (km < 1) return 15;
  if (km < 5) return 13;
  if (km < 15) return 11;
  if (km < 40) return 9;
  return 7;
}

function RouteMapInner({
  post,
  className,
  heightClassName,
}: RouteMapInnerProps) {
  const hasCoords =
    post.startLat != null &&
    post.startLng != null &&
    post.endLat != null &&
    post.endLng != null;

  const { viewState, distanceKm } = useMemo(() => {
    if (!hasCoords) {
      return {
        viewState: { ...DEFAULT_CENTER, zoom: 11 },
        distanceKm: post.totalDistanceKm ?? null,
      };
    }
    const midLat = ((post.startLat as number) + (post.endLat as number)) / 2;
    const midLng = ((post.startLng as number) + (post.endLng as number)) / 2;
    const dist = haversineKm(
      post.startLat as number,
      post.startLng as number,
      post.endLat as number,
      post.endLng as number,
    );
    return {
      viewState: {
        longitude: midLng,
        latitude: midLat,
        zoom: getZoomForDistance(dist),
      },
      distanceKm: post.totalDistanceKm ?? Math.round(dist * 10) / 10,
    };
  }, [hasCoords, post]);

  const [vs, setVs] = useState<ViewState>(viewState);

  const geojson = useMemo(() => {
    if (!hasCoords) return null;
    const coords: [number, number][] = [
      [post.startLng as number, post.startLat as number],
      ...((post.waypoints as Coordinate[] | undefined)?.map(
        (wp) => [wp.lng, wp.lat] as [number, number],
      ) ?? []),
      [post.endLng as number, post.endLat as number],
    ];
    return {
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: coords },
      properties: {},
    };
  }, [hasCoords, post]);

  if (!Map || !Marker || !Source || !Layer || !NavigationControl)
    return null;

  const MapComponent = Map;
  const MarkerComponent = Marker;
  const NavControl = NavigationControl;

  return (
     <div
       className={[
         "relative rounded-xl overflow-hidden h-full w-full",
         heightClassName,
         className ?? "",
       ]
       .join(" ")
       .trim()}>
       <MapComponent
         {...vs}
         onMove={(evt) => setVs(evt.viewState)}
         mapStyle={MAP_STYLE}
         attributionControl={false}>
        <NavControl position="bottom-right" />

        {hasCoords && (
          <>
            <MarkerComponent
              longitude={post.startLng as number}
              latitude={post.startLat as number}
              anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white shadow-lg border-2 border-white">
                  S
                </div>
                <div className="mt-0.5 whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Start
                </div>
              </div>
            </MarkerComponent>

            <MarkerComponent
              longitude={post.endLng as number}
              latitude={post.endLat as number}
              anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg border-2 border-white">
                  E
                </div>
                <div className="mt-0.5 whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  End
                </div>
              </div>
            </MarkerComponent>

            {/* Waypoint markers */}
            {(post.waypoints as Coordinate[] | undefined)?.map(
              (wp, i) => (
                <MarkerComponent
                  key={i}
                  longitude={wp.lng}
                  latitude={wp.lat}
                  anchor="center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]/80 text-[10px] font-bold text-white shadow border-2 border-white">
                    {i + 1}
                  </div>
                </MarkerComponent>
              ),
            )}

            {/* Route polyline */}
            {geojson && (
              <Source id="route-line" type="geojson" data={geojson}>
                <Layer
                  id="route-line-layer"
                  type="line"
                  paint={{
                    "line-color": "#3b82f6",
                    "line-width": 3,
                    "line-opacity": 0.7,
                  }}
                />
              </Source>
            )}
          </>
        )}
      </MapComponent>

      {/* Glass overlay summary card */}
      {(distanceKm != null || post.estimatedMins != null || post.region) && (
        <div className="absolute top-3 left-3 max-w-[180px] pointer-events-none">
          <AppCard variant="glass" padding="sm" className="!rounded-xl">
            <div className="space-y-1">
              {post.region && (
                <div className="flex items-center gap-1">
                  <AppTag
                    label={post.region}
                    variant="primary"
                    size="xs"
                    icon={MapPin}
                  />
                </div>
              )}
              {distanceKm != null && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-primary)]">
                  <Route size={11} className="shrink-0" />
                  <span>{distanceKm} km</span>
                </div>
              )}
              {post.estimatedMins != null && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-primary)]">
                  <Clock size={11} className="shrink-0" />
                  <span>~{post.estimatedMins} min</span>
                </div>
              )}
            </div>
          </AppCard>
        </div>
      )}

      {!hasCoords && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <span className="text-xs bg-black/40 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            No coordinates — showing default area
          </span>
        </div>
      )}
    </div>
  );
}

function RouteMapFallback({
  post,
  className,
  heightClassName,
}: RouteMapInnerProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border border-[var(--color-border)]",
        heightClassName,
        className ?? "",
      ]
        .join(" ")
        .trim()}>
      <div className="absolute inset-0 bg-[var(--color-bg-elevated)]" />
      <div className="absolute inset-0 opacity-50 route-map-fallback-pattern" />
      <div className="relative flex h-full items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-[var(--color-bg-base)]/80 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] shadow-card">
          <MapPin size={14} className="text-[var(--color-primary)]" />
          <span>
            {post.region ? `${post.region} preview` : "Route map preview"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RouteMap({
  post,
  height = 300,
  className,
  collapsible = false,
}: RouteMapProps): React.ReactElement | null {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Dynamically import maplibre on the client only
    Promise.all([
      import("maplibre-gl/dist/maplibre-gl.css" as string),
      import("react-map-gl/maplibre"),
    ])
      .then(([, mapglModule]) => {
        Map = mapglModule.default;
        Marker = mapglModule.Marker;
        Source = mapglModule.Source;
        Layer = mapglModule.Layer;
        NavigationControl = mapglModule.NavigationControl;
        setReady(true);
      })
      .catch(() => {
        // Map unavailable — silently skip
      });
  }, []);

  const heightClassName =
    height === "full" ? "h-full" : (HEIGHT_CLASS_MAP[height] ?? "h-[300px]");

  const mapContent = ready ? (
    <RouteMapInner
      post={post}
      className={className}
      heightClassName={heightClassName}
    />
  ) : (
    <RouteMapFallback
      post={post}
      className={className}
      heightClassName={heightClassName}
    />
  );

  if (collapsible) {
    return (
      <div className={className}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors">
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-[var(--color-primary)]" />
            Route map
          </span>
          <span className="text-[var(--color-text-secondary)] text-xs">
            {open ? "Hide" : "Show"}
          </span>
        </button>
        {open && <div className="mt-2">{mapContent}</div>}
      </div>
    );
  }

  return mapContent;
}
