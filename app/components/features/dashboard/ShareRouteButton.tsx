"use client";

import React, { useState } from "react";
import { Button, FloatButton } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { ShareRouteModal } from "@/components/features/posts/ShareRouteModal";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface ShareRouteButtonProps {
  onPostCreated?: (post: Post) => void;
}

export function ShareRouteButton({ onPostCreated }: ShareRouteButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (postData: Partial<Post>) => {
    const newPost: Partial<Post> = {
      ...postData,
      userId: "1", // Replace with actual current user ID
      likes: 0,
      dislikes: 0,
      comments: 0,
      bookmarks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await api.post<Post>(API_ENDPOINTS.POSTS, newPost);
      onPostCreated?.(response.data);
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  };

  return (
    <>
      {/* Desktop Button */}
      <div className="hidden md:block">
        <Button
          type="primary"
          size="large"
          icon={<EditOutlined />}
          onClick={() => setModalOpen(true)}
          block
          className="bg-[#00623B] hover:bg-[#004d2e] h-12">
          Share a route
        </Button>
      </div>

      {/* Mobile Floating Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setModalOpen(true)}
        className="md:hidden"
        style={{
          right: 24,
          bottom: 100,
          width: 60,
          height: 60,
          backgroundColor: "#00623B",
        }}
      />

      {/* Share Route Modal */}
      <ShareRouteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
