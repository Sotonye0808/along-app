"use client";

import React, { useState } from "react";
import { Modal, Input, Button, Avatar, Space, Divider, Empty } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
  SendOutlined,
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
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

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
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        @{comment.author.userName}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {formatDate(comment.createdAt)}
                      </span>
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
                      {comment.dislikes > 0 && formatNumber(comment.dislikes)}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
