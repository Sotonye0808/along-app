import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "app/(public)/blog/posts");

export interface BlogPostFrontmatter {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readingTime: number;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep > 0) {
      const key = line.slice(0, sep).trim();
      const val = line.slice(sep + 1).trim().replace(/^"(.*)"$/, "$1");
      frontmatter[key] = val;
    }
  }
  return { frontmatter, content: match[2].trim() };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { frontmatter, content } = parseFrontmatter(raw);
      const slug = file.replace(/\.mdx$/, "");
      return {
        slug,
        title: frontmatter.title ?? slug,
        description: frontmatter.description ?? "",
        date: frontmatter.date ?? "",
        author: frontmatter.author ?? "Along Team",
        category: frontmatter.category ?? "updates",
        image: frontmatter.image ?? "/og-image.png",
        readingTime: Number(frontmatter.readingTime) || 1,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
