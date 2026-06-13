import { buildMetadata } from "@/app/lib/utils/metadata";

export const metadata = buildMetadata({
  title: "Invite Friends",
  description: "Invite friends to Along and earn rewards.",
  path: "/invite",
});

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
