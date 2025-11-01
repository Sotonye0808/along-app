"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Upload, App, Avatar, Button } from "antd";
import { UploadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import {
  getCurrentLocation,
  isGeolocationAvailable,
} from "@/lib/utils/geolocation";

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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { message, modal } = App.useApp();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        bio: user.bio || "",
        location: user.location || "",
      });
      setAvatarFile(user.avatar || null);
    }
  }, [open, user, form]);

  const handleAvatarChange = (file: RcFile) => {
    // Convert to base64 for mock backend
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarFile(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Prevent default upload behavior
    return false;
  };

  const handleBeforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    handleAvatarChange(file);
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updatedData: Partial<User> = {
        ...values,
        avatar: avatarFile || user.avatar,
      };

      await onSave(updatedData);
      message.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAvatarFile(user.avatar || null);
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    // Prompt guest users to create account
    if (!isAuthenticated) {
      modal.confirm({
        title: "Create an Account",
        content:
          "You need to create an account to use your current location. This helps personalize your experience and show you relevant routes near you.",
        okText: "Sign Up",
        cancelText: "Cancel",
        onOk: () => {
          // Redirect to registration page
          window.location.href = "/register";
        },
      });
      return;
    }

    if (!isGeolocationAvailable()) {
      message.error("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);

    try {
      const location = await getCurrentLocation();
      form.setFieldsValue({ location: location.formatted });
      message.success("Location detected successfully!");
    } catch (error: any) {
      console.error("Failed to get location:", error);
      message.error(error.message || "Failed to get current location");
    } finally {
      setGettingLocation(false);
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Save Changes"
      cancelText="Cancel"
      confirmLoading={loading}
      width={600}
      okButtonProps={{
        className: "bg-[#00623B] hover:bg-[#004d2e]",
      }}>
      <Form form={form} layout="vertical" className="mt-4">
        {/* Avatar Upload */}
        <Form.Item label="Profile Picture">
          <div className="flex items-center gap-4">
            <Avatar
              size={80}
              src={avatarFile}
              className="border-2 border-[#00623B]">
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              maxCount={1}>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:border-[#00623B] hover:text-[#00623B] transition-colors">
                <UploadOutlined className="mr-2" />
                Change Picture
              </button>
            </Upload>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Recommended: Square image, at least 400x400px
          </p>
        </Form.Item>

        {/* First Name */}
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[
            { required: true, message: "Please enter your first name" },
            { min: 2, message: "First name must be at least 2 characters" },
          ]}>
          <Input placeholder="Enter your first name" />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[
            { required: true, message: "Please enter your last name" },
            { min: 2, message: "Last name must be at least 2 characters" },
          ]}>
          <Input placeholder="Enter your last name" />
        </Form.Item>

        {/* Username */}
        <Form.Item
          label="Username"
          name="userName"
          rules={[
            { required: true, message: "Please enter a username" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                "Username can only contain letters, numbers, and underscores",
            },
            { min: 3, message: "Username must be at least 3 characters" },
          ]}>
          <Input placeholder="Enter your username" prefix="@" />
        </Form.Item>

        {/* Bio */}
        <Form.Item
          label="Bio"
          name="bio"
          rules={[
            { max: 160, message: "Bio must be less than 160 characters" },
          ]}>
          <Input.TextArea
            placeholder="Tell us about yourself..."
            rows={4}
            showCount
            maxLength={160}
          />
        </Form.Item>

        {/* Location */}
        <Form.Item
          label="Location"
          name="location"
          rules={[
            { max: 50, message: "Location must be less than 50 characters" },
          ]}>
          <div className="flex gap-2">
            <Input placeholder="e.g., Lagos, Nigeria" className="flex-1" />
            <Button
              icon={<EnvironmentOutlined />}
              onClick={handleUseCurrentLocation}
              loading={gettingLocation}
              title="Use current location"
              className="flex-shrink-0">
              Use Current
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click "Use Current" to automatically detect your location
          </p>
        </Form.Item>
      </Form>
    </Modal>
  );
}
