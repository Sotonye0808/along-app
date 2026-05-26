"use client";

import React, { lazy, Suspense, useState } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES, API_ENDPOINTS } from "@/lib/constants";
import { useAuth } from "@/app/providers/AuthProvider";
import { api } from "@/lib/utils/api";
import { ModalService } from "@/lib/services/modalService";
import { ToastService } from "@/lib/services/toastService";
import { AppButton } from "@/components/ui/AppButton";
import { AppSpinner } from "@/components/ui/AppSpinner";

const ShareRouteModal = lazy(() =>
  import("@/components/features/posts/ShareRouteModal").then((mod) => ({
    default: mod.ShareRouteModal,
  })),
);

interface ShareRouteButtonProps {
  onPostCreated?: (post: Post) => void;
}

export function ShareRouteButton({ onPostCreated }: ShareRouteButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleButtonClick = async () => {
    if (!isAuthenticated || !user) {
      const confirmed = await ModalService.confirm({
        title: "Login required",
        description:
          "You need to be logged in to share routes. Would you like to log in now?",
        confirmLabel: "Log in",
        cancelLabel: "Cancel",
      });
      if (confirmed) {
        router.push(APP_ROUTES.LOGIN);
      }
      return;
    }
    setModalOpen(true);
  };

  const handleSubmit = async (postData: Partial<Post>) => {
    if (!user) {
      ToastService.error("User not authenticated");
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
      <div className="hidden md:block">
        <AppButton
          size="lg"
          icon={MapPin}
          fullWidth
          onClick={() => {
            void handleButtonClick();
          }}
          className="h-12 text-base">
          Share a route
        </AppButton>
      </div>

      <button
        type="button"
        onClick={() => {
          void handleButtonClick();
        }}
        className="fixed bottom-24 right-6 z-40 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_8px_32px_rgba(0,98,59,0.15)] transition-transform hover:scale-105 active:scale-95 md:hidden"
        aria-label="Share a route">
        <MapPin size={26} aria-hidden="true" />
      </button>

      {modalOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/20">
              <AppSpinner size={28} className="text-[var(--color-primary)]" />
            </div>
          }>
          <ShareRouteModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
          />
        </Suspense>
      )}
    </>
  );
}
