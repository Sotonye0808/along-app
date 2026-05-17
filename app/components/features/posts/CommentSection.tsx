"use client";

import React, { memo, useCallback, useRef, useState } from "react";
import { MoreHorizontal, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { CommentText, extractMentions } from "@/lib/utils/commentParser";
import { ModalService } from "@/lib/services/modalService";
import { UndoService } from "@/lib/services/undoService";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppDropdown } from "@/components/ui/AppDropdown";
import { AppModal } from "@/components/ui/AppModal";
import { AppTextarea } from "@/components/ui/AppTextarea";
import { AppUserLabel } from "@/components/ui/AppUserLabel";

interface CommentSectionProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  comments: (PostComment & { author: User })[];
  currentUser: User | null;
  onAddComment: (postId: string, text: string) => Promise<void>;
  onLikeComment?: (commentId: string) => void;
  onDislikeComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, newText: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onShowLoginModal?: () => void;
}

export const CommentSection = memo(function CommentSection({
  open,
  onClose,
  postId,
  comments,
  currentUser,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onEditComment,
  onDeleteComment,
  onShowLoginModal,
}: CommentSectionProps): React.ReactElement {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  function handleTextChange(value: string): void {
    setCommentText(value);
    const cursorPos = textareaRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, cursorPos);
    const mentionMatch = /@([a-zA-Z0-9_]*)$/.exec(before);
    setMentionQuery(mentionMatch ? mentionMatch[1] : null);
  }

  function insertMention(userName: string): void {
    const cursorPos = textareaRef.current?.selectionStart ?? commentText.length;
    const before = commentText.slice(0, cursorPos);
    const after = commentText.slice(cursorPos);
    const replaced = before.replace(/@[a-zA-Z0-9_]*$/, `@${userName} `);
    setCommentText(replaced + after);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  const mentionCandidates =
    mentionQuery !== null
      ? comments
          .map((c) => c.author)
          .filter(
            (a, i, arr) =>
              arr.findIndex((x) => x.id === a.id) === i &&
              a.userName.toLowerCase().startsWith(mentionQuery.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  async function handleSubmit(): Promise<void> {
    const text = commentText.trim();
    if (!text) return;
    setLoading(true);
    try {
      await onAddComment(postId, text);
      void extractMentions(text);
      setCommentText("");
      setMentionQuery(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(commentId: string): Promise<void> {
    const text = editText.trim();
    if (!text || !onEditComment) return;
    setLoading(true);
    try {
      await onEditComment(commentId, text);
      setEditingId(null);
      setEditText("");
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      const confirmed = await ModalService.confirm({
        title: "Delete comment",
        description: "This will be undoable for 10 seconds.",
        confirmLabel: "Delete",
        destructive: true,
      });
      if (!confirmed) return;

      UndoService.registerAction(
        "Comment deleted",
        () => {
          onDeleteComment?.(commentId).catch(console.error);
        },
        10_000,
      );
    },
    [onDeleteComment],
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Comments (${comments.length})`}
      size="default"
      footer={null}>
      <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto">
        {currentUser ? (
          <div className="flex gap-3">
            <AppAvatar user={currentUser} size={40} linkToProfile={false} />
            <div className="relative flex-1">
              <AppTextarea
                ref={textareaRef}
                placeholder="Write a comment… Use @username to mention"
                value={commentText}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={500}
              />
              {mentionCandidates.length > 0 ? (
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-base)] shadow-lg">
                  {mentionCandidates.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(user.userName);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-elevated)]">
                      <AppAvatar user={user} size={24} linkToProfile={false} />
                      <div>
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="ml-1 text-xs text-[var(--color-text-secondary)]">
                          @{user.userName}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-2 flex justify-end">
                <AppButton
                  icon={Send}
                  onClick={() => void handleSubmit()}
                  loading={loading}
                  disabled={!commentText.trim()}>
                  Comment
                </AppButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <AppButton variant="ghost" onClick={onShowLoginModal}>
              Sign in to comment
            </AppButton>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4" role="list">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3" role="listitem">
                <AppAvatar user={comment.author} size={40} />
                <div className="min-w-0 flex-1">
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <AppTextarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        maxLength={500}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <AppButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}>
                          Cancel
                        </AppButton>
                        <AppButton
                          size="sm"
                          loading={loading}
                          disabled={!editText.trim()}
                          onClick={() => void handleSaveEdit(comment.id)}>
                          Save
                        </AppButton>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-[var(--radius-card)] bg-[var(--color-bg-elevated)] px-3 py-2">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <AppUserLabel
                              user={comment.author}
                              showHandle
                              showFullName
                              avatarSize={24}
                              linkToProfile
                            />
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {currentUser?.id === comment.userId ? (
                            <AppDropdown
                              items={[
                                {
                                  key: "edit",
                                  label: "Edit",
                                  onClick: () => {
                                    setEditingId(comment.id);
                                    setEditText(comment.text);
                                  },
                                },
                                {
                                  key: "delete",
                                  label: "Delete",
                                  danger: true,
                                  onClick: () =>
                                    void handleDeleteComment(comment.id),
                                },
                              ]}
                              placement="bottomRight">
                              <AppButton
                                variant="icon"
                                size="sm"
                                icon={MoreHorizontal}
                                ariaLabel="More comment actions"
                              />
                            </AppDropdown>
                          ) : null}
                        </div>
                        <p className="text-sm text-[var(--color-text-primary)]">
                          <CommentText text={comment.text} />
                        </p>
                      </div>
                      <div className="ml-2 mt-1.5 flex items-center gap-3">
                        <AppButton
                          variant="ghost"
                          size="sm"
                          icon={ThumbsUp}
                          onClick={() => {
                            if (!currentUser) {
                              onShowLoginModal?.();
                              return;
                            }
                            onLikeComment?.(comment.id);
                          }}>
                          {comment.likes > 0 ? formatNumber(comment.likes) : ""}
                        </AppButton>
                        <AppButton
                          variant="ghost"
                          size="sm"
                          icon={ThumbsDown}
                          onClick={() => {
                            if (!currentUser) {
                              onShowLoginModal?.();
                              return;
                            }
                            onDislikeComment?.(comment.id);
                          }}>
                          {comment.dislikes > 0
                            ? formatNumber(comment.dislikes)
                            : ""}
                        </AppButton>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppModal>
  );
});
