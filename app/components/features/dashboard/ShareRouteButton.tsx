"use client";

import React, { useState } from "react";
import { Button, FloatButton, App } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { ShareRouteModal } from "@/components/features/posts/ShareRouteModal";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface ShareRouteButtonProps {
  onPostCreated?: (post: Post) => void;
}

export function ShareRouteButton({ onPostCreated }: ShareRouteButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { message, modal } = App.useApp();
  const router = useRouter();

  const handleButtonClick = () => {
    if (!isAuthenticated || !user) {
      modal.confirm({
        title: "Login Required",
        content:
          "You need to be logged in to share routes. Would you like to login now?",
        okText: "Login",
        cancelText: "Cancel",
        onOk: () => {
          router.push(APP_ROUTES.LOGIN);
        },
      });
      return;
    }
    setModalOpen(true);
  };

  const handleSubmit = async (postData: Partial<Post>) => {
    if (!user) {
      message.error("User not authenticated");
      return;
    }

    const newPost: Partial<Post> = {
      ...postData,
      userId: user.id,
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
          onClick={handleButtonClick}
          block
          className="bg-[#00623B] hover:bg-[#004d2e] h-12">
          Share a route
        </Button>
      </div>

      {/* Mobile Floating Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={handleButtonClick}
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
