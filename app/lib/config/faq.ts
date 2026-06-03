export interface FaqCategory {
  id: string;
  category: string;
  items: { id: string; question: string; answer: string }[];
}

export const DEFAULT_FAQ_ITEMS: FaqCategory[] = [
  {
    id: "getting-started",
    category: "Getting Started",
    items: [
      {
        id: "what-is-along",
        question: "What is Along?",
        answer:
          "Along is a social travel-intelligence platform that lets users share, verify, and discover transport routes in West Africa. Think of it as crowd-sourced transit info — real-time route updates, fare details, and community-verified travel intelligence.",
      },
      {
        id: "how-to-sign-up",
        question: "How do I sign up?",
        answer:
          "Click the 'Sign Up' button on the login page. You can register with your email address or use Google OAuth. After registering, you'll be able to follow other reporters, share routes, and earn trust badges.",
      },
      {
        id: "is-along-free",
        question: "Is Along free to use?",
        answer:
          "Yes, Along is completely free for all users. We believe travel information should be accessible to everyone.",
      },
    ],
  },
  {
    id: "routes",
    category: "Routes & Posts",
    items: [
      {
        id: "how-to-share-route",
        question: "How do I share a route?",
        answer:
          "Tap the 'Share Route' button from the navigation menu. Add your start and end locations, waypoints, fare details, transport mode, and any relevant photos. The more details you provide, the higher your post's quality score.",
      },
      {
        id: "route-verification",
        question: "How are routes verified?",
        answer:
          "Routes are scored by our ValidityEngine, which considers community feedback (likes/dislikes), route detail, corroboration from other users, and recency. Higher-scoring routes earn TrustBadges (Bronze → Platinum).",
      },
      {
        id: "editing-post",
        question: "Can I edit or delete a post?",
        answer:
          "Yes, you can edit or delete your own posts from your profile page. Edits may reset the recency component of your post's validity score.",
      },
    ],
  },
  {
    id: "trust",
    category: "Trust & Rewards",
    items: [
      {
        id: "trust-badges",
        question: "What are TrustBadges?",
        answer:
          "TrustBadges indicate the reliability of a route post. Levels range from Low → Developing → Verified → Trusted. Badges are earned through consistent, detailed, and well-received route sharing.",
      },
      {
        id: "reward-points",
        question: "How do reward points work?",
        answer:
          "You earn points for actions like creating posts, receiving likes, and getting bookmarks. Points determine your reward tier (Bronze, Silver, Gold, Platinum), which unlocks perks and recognition in the community.",
      },
      {
        id: "invite-friends",
        question: "How do I invite friends?",
        answer:
          "Go to the Invite page from your profile menu. You'll find a shareable invite link and code. When someone signs up using your invite, you earn bonus reward points.",
      },
    ],
  },
  {
    id: "privacy",
    category: "Privacy & Safety",
    items: [
      {
        id: "data-protection",
        question: "How is my data protected?",
        answer:
          "We comply with the Nigeria Data Protection Regulation (NDPR). Your personal information is encrypted, never sold to third parties, and you can request data deletion at any time. See our Privacy Policy for details.",
      },
      {
        id: "report-content",
        question: "How do I report inappropriate content?",
        answer:
          "Use the Report Bug page to flag problematic posts, or contact our moderation team through the Contact page. Admins review all reports and take appropriate action.",
      },
    ],
  },
];
