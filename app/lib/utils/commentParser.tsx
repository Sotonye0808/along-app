import React from "react";
import Link from "next/link";

// Matches @username — starts with @, followed by 1-20 alphanumeric/underscore chars
const MENTION_RE = /@([a-zA-Z0-9_]{1,20})/g;

interface ParsedSegment {
  type: "text" | "mention";
  value: string;
}

/**
 * Parses a comment string and splits it into text and @mention segments.
 */
export function parseComment(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MENTION_RE.lastIndex = 0;

  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "mention", value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Renders a comment string with @mentions converted to profile links.
 */
export function CommentText({
  text,
}: {
  text: string;
}): React.ReactElement {
  const segments = parseComment(text);

  return (
    <span>
      {segments.map((segment, i) => {
        if (segment.type === "mention") {
          return (
            <Link
              key={i}
              href={`/profile/${segment.value}`}
              className="font-medium text-[var(--color-primary)] hover:underline">
              @{segment.value}
            </Link>
          );
        }
        return <span key={i}>{segment.value}</span>;
      })}
    </span>
  );
}

/**
 * Extract all @mentioned usernames from a comment string.
 */
export function extractMentions(text: string): string[] {
  const mentions: string[] = [];
  let match: RegExpExecArray | null;
  MENTION_RE.lastIndex = 0;
  while ((match = MENTION_RE.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
}
