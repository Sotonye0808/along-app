"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, ExternalLink, MapPin, Users } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { AppTag } from "@/components/ui/AppTag";
import { AppButton } from "@/components/ui/AppButton";

interface TegaEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  attendees: number;
  category: string;
  externalUrl?: string;
}

// Static seed events until Tega API integration is live.
// These represent the integration shape — real data will replace via /api/events.
const SEED_EVENTS: TegaEvent[] = [
  {
    id: "evt-1",
    title: "Lagos Mobility Hackathon",
    description:
      "Build the next generation of urban transport solutions for Lagos. Team up with engineers, designers, and urban planners.",
    location: "VI, Lagos",
    date: "2026-06-14",
    attendees: 120,
    category: "Hackathon",
  },
  {
    id: "evt-2",
    title: "BRT Commuter Community Meetup",
    description:
      "Monthly gathering for BRT regulars — share route tips, report delays, and meet fellow commuters.",
    location: "Oshodi, Lagos",
    date: "2026-05-28",
    attendees: 45,
    category: "Meetup",
  },
  {
    id: "evt-3",
    title: "Route Photography Walk",
    description:
      "Document iconic Lagos routes through photography. Routes, faces, fares — tell the commuter story.",
    location: "Marina → Obalende",
    date: "2026-06-07",
    attendees: 30,
    category: "Community",
  },
  {
    id: "evt-4",
    title: "Abuja Transport Forum 2026",
    description:
      "City-wide forum on urban transport planning in Nigeria's capital. Policy makers, tech builders and citizens together.",
    location: "Wuse, Abuja",
    date: "2026-07-03",
    attendees: 200,
    category: "Forum",
  },
];

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<TegaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    // TODO: Replace with real Tega Events API call when available.
    await new Promise<void>((r) => setTimeout(r, 400));
    setEvents(SEED_EVENTS);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Calendar size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
            Events
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Travel meetups and community events powered by{" "}
            <strong className="text-[var(--color-primary)]">Tega</strong>.
          </p>
        </div>
        <AppTag label="Tega Powered" variant="primary" size="sm" icon={ExternalLink} />
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <AppSpinner size={32} />
        </div>
      ) : events.length === 0 ? (
        <AppEmptyState
          icon={Calendar}
          title="No events yet"
          description="Check back soon for upcoming community events."
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <AppCard key={event.id} variant="default" hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[var(--color-text-primary)] leading-snug">
                      {event.title}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <AppTag label={event.category} variant="info" size="xs" />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} aria-hidden="true" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" />
                    {formatEventDate(event.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} aria-hidden="true" />
                    {event.attendees} attending
                  </span>
                </div>

                {event.externalUrl && (
                  <AppButton
                    variant="secondary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => window.open(event.externalUrl, "_blank", "noopener")}
                  >
                    Register
                  </AppButton>
                )}
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
}
