export interface BlogCategory {
  id: string;
  label: string;
  description: string;
}

export interface BlogLayoutConfig {
  postsPerPage: number;
  featuredCount: number;
}

export const DEFAULT_BLOG_CATEGORIES: BlogCategory[] = [
  { id: "all", label: "All Posts", description: "Every blog post" },
  { id: "tips", label: "Travel Tips", description: "Commuting advice and best practices" },
  { id: "updates", label: "Platform Updates", description: "New features and improvements" },
  { id: "community", label: "Community", description: "Stories from the Along community" },
  { id: "routes", label: "Route Guides", description: "Detailed route breakdowns and guides" },
];

export const BLOG_LAYOUT_CONFIG: BlogLayoutConfig = {
  postsPerPage: 12,
  featuredCount: 1,
};
