"use client";

import React, { useState } from "react";
import {
  Modal,
  Input,
  Button,
  Avatar,
  Space,
  Divider,
  Empty,
  Dropdown,
  App,
} from "antd";
import type { MenuProps } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
  SendOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { formatDate, formatNumber } from "@/lib/utils/format";

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
}

export function CommentSection({
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
}: CommentSectionProps) {
  const { message, notification } = App.useApp();
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await onAddComment(postId, commentText.trim());
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (comment: PostComment & { author: User }) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim() || !onEditComment) return;

    setLoading(true);
    try {
      await onEditComment(commentId, editText.trim());
      setEditingCommentId(null);
      setEditText("");
      message.success("Comment updated successfully");
    } catch (error) {
      console.error("Failed to update comment:", error);
      message.error("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!onDeleteComment) return;

    const key = `delete-comment-${commentId}`;
    let undoClicked = false;

    notification.open({
      key,
      message: "Comment deleted",
      description: "Undo within 10 seconds",
      duration: 10,
      btn: (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            undoClicked = true;
            notification.destroy(key);
            message.info("Deletion cancelled");
          }}>
          Undo
        </Button>
      ),
      onClose: async () => {
        if (!undoClicked) {
          try {
            await onDeleteComment(commentId);
            message.success("Comment deleted permanently");
          } catch (error) {
            console.error("Failed to delete comment:", error);
            message.error("Failed to delete comment");
          }
        }
      },
    });
  };

  return (
    <Modal
      title={
        <div className="text-lg font-semibold">
          Comments ({comments.length})
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}>
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Add Comment */}
        {currentUser && (
          <div className="sticky top-0 bg-white z-10 pb-4 mb-4 border-b">
            <div className="flex gap-3">
              <Avatar src={currentUser.avatar} size={40}>
                {currentUser.firstName[0]}
                {currentUser.lastName[0]}
              </Avatar>
              <div className="flex-1">
                <Input.TextArea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  maxLength={500}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleSubmit();
                  }}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!commentText.trim()}
                    className="bg-[#00623B]">
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <Empty
            description="No comments yet"
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar src={comment.author.avatar} size={40}>
                  {comment.author.firstName[0]}
                  {comment.author.lastName[0]}
                </Avatar>
                <div className="flex-1">
                  {editingCommentId === comment.id ? (
                    // Edit Mode
                    <div className="space-y-2">
                      <Input.TextArea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        maxLength={500}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="small" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleSaveEdit(comment.id)}
                          loading={loading}
                          disabled={!editText.trim()}
                          className="bg-[#00623B]">
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900">
                              {comment.author.firstName}{" "}
                              {comment.author.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              @{comment.author.userName}
                            </span>
                            <span className="text-xs text-gray-400">
                              • {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {currentUser?.id === comment.userId && (
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: "edit",
                                    icon: <EditOutlined />,
                                    label: "Edit",
                                    onClick: () => handleStartEdit(comment),
                                  },
                                  {
                                    key: "delete",
                                    icon: <DeleteOutlined />,
                                    label: "Delete",
                                    danger: true,
                                    onClick: () =>
                                      handleDeleteComment(comment.id),
                                  },
                                ] as MenuProps["items"],
                              }}
                              trigger={["click"]}>
                              <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                className="text-gray-400 hover:text-gray-600"
                              />
                            </Dropdown>
                          )}
                        </div>
                        <p className="text-gray-800 text-sm">{comment.text}</p>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 mt-2 ml-2">
                        <Button
                          type="text"
                          size="small"
                          icon={<LikeOutlined />}
                          onClick={() => onLikeComment?.(comment.id)}>
                          {comment.likes > 0 && formatNumber(comment.likes)}
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<DislikeOutlined />}
                          onClick={() => onDislikeComment?.(comment.id)}>
                          {comment.dislikes > 0 &&
                            formatNumber(comment.dislikes)}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
