"use client";

import React, { useEffect, useMemo, useState } from "react";
import { App, Upload } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { Crosshair } from "lucide-react";
import { EDIT_PROFILE_FIELDS } from "@/lib/config/forms";
import {
  getCurrentLocation,
  isGeolocationAvailable,
} from "@/lib/utils/geolocation";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";
import { ConfigDrivenForm } from "@/components/ui/ConfigDrivenForm";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSave: (userData: Partial<User>) => Promise<void>;
  isAuthenticated?: boolean;
}

export function EditProfileModal({
  open,
  onClose,
  user,
  onSave,
  isAuthenticated = true,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [avatarFile, setAvatarFile] = useState<string | undefined>(undefined);
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});
  const [formVersion, setFormVersion] = useState(0);

  const { message, modal } = App.useApp();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftValues({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      bio: user.bio || "",
      location: user.location || "",
    });
    setAvatarFile(user.avatar);
    setFormVersion((prev) => prev + 1);
  }, [open, user]);

  const previewUser = useMemo(
    () => ({
      userName: String(draftValues.userName || user.userName),
      firstName: String(draftValues.firstName || user.firstName),
      avatar: avatarFile,
      verified: user.verified,
    }),
    [
      draftValues.userName,
      draftValues.firstName,
      avatarFile,
      user.userName,
      user.firstName,
      user.verified,
    ],
  );

  function handleBeforeUpload(file: RcFile): false | typeof Upload.LIST_IGNORE {
    if (!file.type.startsWith("image/")) {
      message.error("Only image files are supported.");
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 > 2) {
      message.error("Image must be smaller than 2MB.");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarFile(reader.result);
      }
    };
    reader.readAsDataURL(file);
    return false;
  }

  async function handleUseCurrentLocation(): Promise<void> {
    if (!isAuthenticated) {
      modal.confirm({
        title: "Create an account",
        content:
          "You need an account to use live location for profile personalization.",
        okText: "Sign Up",
        cancelText: "Cancel",
        onOk: () => {
          window.location.href = "/register";
        },
      });
      return;
    }

    if (!isGeolocationAvailable()) {
      message.error("Geolocation is not supported by this browser.");
      return;
    }

    setGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setDraftValues((prev) => ({ ...prev, location: location.formatted }));
      setFormVersion((prev) => prev + 1);
      message.success("Location detected successfully.");
    } catch (error) {
      const maybeError = error as { message?: string };
      message.error(maybeError.message || "Failed to get current location.");
    } finally {
      setGettingLocation(false);
    }
  }

  async function handleSubmit(values: Record<string, unknown>): Promise<void> {
    setLoading(true);
    try {
      await onSave({
        firstName: String(values.firstName || ""),
        lastName: String(values.lastName || ""),
        userName: String(values.userName || ""),
        bio: String(values.bio || ""),
        location: String(values.location || ""),
        avatar: avatarFile || user.avatar,
      });
      message.success("Profile updated successfully.");
      onClose();
    } catch (error) {
      message.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Edit profile"
      subtitle="Update your public identity"
      size="default"
      footer={null}>
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-3">
          <div className="mb-3 flex items-center gap-3">
            <AppAvatar user={previewUser} size={80} linkToProfile={false} />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              maxCount={1}>
              <AppButton variant="secondary">Change picture</AppButton>
            </Upload>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Recommended: square image, at least 400x400.
          </p>
        </div>

        <ConfigDrivenForm<Record<string, unknown>>
          key={formVersion}
          fields={EDIT_PROFILE_FIELDS}
          initialValues={draftValues}
          submitLabel={loading ? "Saving..." : "Save changes"}
          loading={loading}
          onSubmit={(values) => handleSubmit(values)}
        />

        <div className="border-t border-[var(--color-border)] pt-2">
          <AppButton
            variant="ghost"
            icon={Crosshair}
            onClick={() => void handleUseCurrentLocation()}
            loading={gettingLocation}>
            Use current location
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}
