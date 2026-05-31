import Image from "next/image";
import { Star } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/config/teamConfig";
import { AppCard } from "@/components/ui/AppCard";
import { getFallbackAvatarUrl } from "@/lib/config/avatar";

// Dummy approved reviews until the real API is wired
const FEATURED_REVIEWS = [
  {
    id: "r1",
    rating: 5,
    comment:
      "Along changed how I commute in Lagos. Real-time route tips from actual commuters is priceless.",
    reviewer: { userName: "chisom_a", firstName: "Chisom", lastName: "A." },
  },
  {
    id: "r2",
    rating: 5,
    comment:
      "Finally an app that understands the BRT-Danfo handoff problem. Saved me hours every week.",
    reviewer: { userName: "babatunde_o", firstName: "Babatunde", lastName: "O." },
  },
  {
    id: "r3",
    rating: 4,
    comment:
      "Great community. The fare estimates are surprisingly accurate. Would love more Abuja routes.",
    reviewer: { userName: "ngozi_b", firstName: "Ngozi", lastName: "B." },
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "fill-[var(--color-warning-text)] text-[var(--color-warning-text)]" : "text-[var(--color-border)]"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-12">
      {/* Mission */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">About Along</h1>
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed max-w-prose">
          Along is a social transport intelligence platform built for West African commuters.
          We believe route knowledge shouldn&apos;t live in someone&apos;s head — it should be
          shared, verified, and accessible to everyone.
        </p>
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed max-w-prose">
          We combine community-sourced route data with validity scoring and local transport
          integrations to give commuters in Lagos, Abuja, and beyond a smarter way to navigate
          their cities.
        </p>
      </section>

      {/* Team */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Meet the Team</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <AppCard key={member.id} variant="elevated" hover>
              <div className="flex flex-col items-center gap-3 text-center">
                <Image
                  src={getFallbackAvatarUrl(member.avatarSeed)}
                  alt={`${member.name} avatar`}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-[var(--color-border)]"
                />
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    {member.name}
                  </p>
                  <p className="text-xs text-[var(--color-primary)] font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                  {member.bio}
                </p>
                {member.socials && member.socials.length > 0 && (
                  <div className="flex gap-3">
                    {member.socials.map((social) => (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </AppCard>
          ))}
        </div>
      </section>

      {/* Reviews carousel */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          What commuters say
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURED_REVIEWS.map((review) => (
            <AppCard key={review.id} variant="glass" glassIntensity="low">
              <div className="space-y-3">
                <StarRating rating={review.rating} />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  — {review.reviewer.firstName} {review.reviewer.lastName}
                </p>
              </div>
            </AppCard>
          ))}
        </div>
      </section>
    </div>
  );
}
