import { DEFAULT_META } from "@/app/lib/config";

type WebSiteData = {
  name: string;
  url: string;
  description: string;
};

export function websiteSchema(data?: Partial<WebSiteData>) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data?.name ?? DEFAULT_META.siteName,
    url: data?.url ?? DEFAULT_META.url,
    description: data?.description ?? DEFAULT_META.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${DEFAULT_META.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type ArticleData = {
  headline: string;
  datePublished: string;
  author: { name: string; url?: string };
  image?: string;
  description?: string;
};

export function articleSchema(data: ArticleData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    datePublished: data.datePublished,
    author: {
      "@type": "Person",
      name: data.author.name,
      url: data.author.url,
    },
    image: data.image ?? DEFAULT_META.ogImage,
    description: data.description,
  };
}

type ProfileData = {
  name: string;
  url: string;
  image?: string;
  description?: string;
};

export function profilePageSchema(data: ProfileData) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: data.name,
      url: data.url,
      image: data.image ?? DEFAULT_META.ogImage,
      description: data.description,
    },
  };
}

export function faqPageSchema(
  questions: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function blogPostingSchema(data: {
  headline: string;
  datePublished: string;
  author: { name: string; url?: string };
  image?: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.headline,
    datePublished: data.datePublished,
    author: {
      "@type": "Person",
      name: data.author.name,
      url: data.author.url,
    },
    image: data.image ?? DEFAULT_META.ogImage,
    description: data.description,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
