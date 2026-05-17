"use client";

import React from "react";
import { Bus, CheckCircle, ExternalLink, MapPin, Zap } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppTag } from "@/components/ui/AppTag";
import { TRANSPORT_INTEGRATION_REGISTRY } from "@/lib/config/mapIntegrations";

const integrations = Object.values(TRANSPORT_INTEGRATION_REGISTRY);

export default function MarketplacePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Bus size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
          Marketplace
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Discover transport providers, rideshares, and local mobility partners.
        </p>
      </div>

      {/* Transport integrations grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <AppCard key={integration.key} variant="elevated" hover>
              <div className="space-y-3">
                {/* Icon + name */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                    <Icon
                      size={20}
                      className="text-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)] leading-tight">
                      {integration.label}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {integration.provider}
                    </p>
                  </div>
                </div>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-1.5">
                  {integration.supportsFareEstimates && (
                    <AppTag label="Fare estimates" variant="info" size="xs" icon={Zap} />
                  )}
                  {integration.supportsRealtime && (
                    <AppTag label="Realtime" variant="primary" size="xs" icon={CheckCircle} />
                  )}
                  {integration.enabled ? (
                    <AppTag label="Active" variant="primary" size="xs" />
                  ) : (
                    <AppTag label="Coming soon" variant="default" size="xs" />
                  )}
                </div>

                {/* CTA */}
                <AppButton
                  variant={integration.enabled ? "secondary" : "ghost"}
                  size="sm"
                  icon={integration.enabled ? MapPin : ExternalLink}
                  disabled={!integration.enabled}
                  className="w-full !justify-center"
                >
                  {integration.enabled ? "View routes" : "Coming soon"}
                </AppButton>
              </div>
            </AppCard>
          );
        })}
      </div>

      {/* Transact partnership callout */}
      <AppCard variant="glass" glassIntensity="low">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              Powered by Transact
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Seamless fare payments and provider integrations across West Africa.
            </p>
          </div>
          <AppButton variant="primary" size="sm" icon={ExternalLink}>
            Learn more
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}