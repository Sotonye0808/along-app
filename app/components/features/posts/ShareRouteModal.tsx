"use client";

import React, { useState, useRef } from "react";
import {
  Modal,
  Button,
  Input,
  Tag,
  Upload,
  Space,
  Avatar,
  Select,
  InputNumber,
  message,
} from "antd";
import {
  PlusOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  PictureOutlined,
  LinkOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";

interface ShareRouteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (postData: Partial<Post>) => Promise<void>;
}

interface RouteInput extends Omit<Route, "id"> {
  tempId: string;
}

const vehicleOptions: { label: string; value: VehicleType; emoji: string }[] = [
  { label: "Taxi", value: "taxi", emoji: "🚕" },
  { label: "Bike", value: "bike", emoji: "🏍️" },
  { label: "Keke", value: "keke", emoji: "🛺" },
  { label: "Bus", value: "bus", emoji: "🚌" },
  { label: "Trekking", value: "trekking", emoji: "🚶" },
  { label: "Car", value: "car", emoji: "🚗" },
];

export function ShareRouteModal({
  open,
  onClose,
  onSubmit,
}: ShareRouteModalProps) {
  const [title, setTitle] = useState("");
  const [routes, setRoutes] = useState<RouteInput[]>([
    { tempId: "1", text: "", links: [], order: 1, vehicles: [], fare: 0 },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number | null>(
    null
  );
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const textAreaRefs = useRef<Record<string, any | null>>({});

  const handleRouteChange = (
    tempId: string,
    field: keyof RouteInput,
    value: any
  ) => {
    setRoutes((prev) =>
      prev.map((route) =>
        route.tempId === tempId ? { ...route, [field]: value } : route
      )
    );

    // Auto-add new route if this is the last one and has content
    const currentRoute = routes.find((r) => r.tempId === tempId);
    const isLastRoute = routes[routes.length - 1].tempId === tempId;

    if (isLastRoute && field === "text" && value.trim().length > 0) {
      setRoutes((prev) => [
        ...prev,
        {
          tempId: Date.now().toString(),
          text: "",
          links: [],
          order: prev.length + 1,
          vehicles: [],
          fare: 0,
        },
      ]);
    }
  };

  const handleRemoveRoute = (tempId: string) => {
    if (routes.length > 1) {
      setRoutes((prev) => prev.filter((route) => route.tempId !== tempId));
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput.toLowerCase())) {
      setTags([...tags, tagInput.toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddLink = () => {
    if (currentRouteIndex !== null && linkUrl && linkText) {
      setRoutes((prev) =>
        prev.map((route, index) =>
          index === currentRouteIndex
            ? {
                ...route,
                links: [...route.links, { url: linkUrl, text: linkText }],
              }
            : route
        )
      );
      setLinkModalOpen(false);
      setLinkUrl("");
      setLinkText("");
      setCurrentRouteIndex(null);
      message.success("Link added!");
    }
  };

  const handleRemoveLink = (routeTempId: string, linkIndex: number) => {
    setRoutes((prev) =>
      prev.map((route) =>
        route.tempId === routeTempId
          ? {
              ...route,
              links: route.links.filter((_, i) => i !== linkIndex),
            }
          : route
      )
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error("Please add a title");
      return;
    }

    const validRoutes = routes.filter((r) => r.text.trim().length > 0);
    if (validRoutes.length === 0) {
      message.error("Please add at least one route");
      return;
    }

    setLoading(true);

    try {
      const postData: Partial<Post> = {
        title: title.trim(),
        routes: validRoutes.map((route, index) => ({
          id: `r${Date.now()}-${index}`,
          text: route.text,
          links: route.links,
          order: index + 1,
          vehicles: route.vehicles,
          fare: route.fare,
        })),
        images: fileList.map((file) => file.url || file.thumbUrl || ""),
        tags,
      };

      await onSubmit(postData);

      // Reset form
      setTitle("");
      setRoutes([
        { tempId: "1", text: "", links: [], order: 1, vehicles: [], fare: 0 },
      ]);
      setTags([]);
      setFileList([]);
      message.success("Post created successfully!");
      onClose();
    } catch (error) {
      message.error("Failed to create post");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const visibleRoutes = routes.filter((route, index) => {
    if (index === 0) return true;
    return routes[index - 1].text.trim() !== "";
  });

  return (
    <>
      <Modal
        title={<div className="text-xl font-bold">Share a route</div>}
        open={open}
        onCancel={onClose}
        width={700}
        footer={null}
        className="share-route-modal">
        <div className="space-y-4 mt-6">
          {/* Title */}
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Give your route a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="large"
              maxLength={100}
              className="text-lg font-semibold"
            />
            <Button type="link" className="text-[#00623B]">
              Drafts
            </Button>
          </div>

          {/* Routes */}
          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
            {visibleRoutes.map((route, index) => (
              <div key={route.tempId} className="flex gap-3">
                <Avatar className="bg-[#00623B] shrink-0 mt-1">
                  {index + 1}
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input.TextArea
                      ref={(el) => {
                        textAreaRefs.current[route.tempId] = el;
                      }}
                      placeholder={
                        index === 0 ? "Where we dey go?" : "Where next?"
                      }
                      value={route.text}
                      onChange={(e) =>
                        handleRouteChange(route.tempId, "text", e.target.value)
                      }
                      maxLength={index === 0 ? 300 : 200}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      className="resize-none"
                    />
                    {routes.length > 1 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveRoute(route.tempId)}
                        className="absolute top-2 right-2"
                      />
                    )}
                  </div>

                  {/* Vehicle selection and fare */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <Select
                      mode="multiple"
                      placeholder="Select vehicles"
                      value={route.vehicles}
                      onChange={(value) =>
                        handleRouteChange(route.tempId, "vehicles", value)
                      }
                      style={{ minWidth: 200 }}
                      size="small"
                      maxTagCount={3}>
                      {vehicleOptions.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </Select.Option>
                      ))}
                    </Select>

                    <InputNumber
                      placeholder="Fare (₦)"
                      value={route.fare || undefined}
                      onChange={(value) =>
                        handleRouteChange(route.tempId, "fare", value || 0)
                      }
                      min={0}
                      prefix="₦"
                      style={{ width: 120 }}
                      size="small"
                    />

                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      size="small"
                      onClick={() => {
                        setCurrentRouteIndex(index);
                        setLinkModalOpen(true);
                      }}>
                      Add link
                    </Button>
                  </div>

                  {/* Links display */}
                  {route.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {route.links.map((link, linkIndex) => (
                        <Tag
                          key={linkIndex}
                          closable
                          onClose={() =>
                            handleRemoveLink(route.tempId, linkIndex)
                          }
                          icon={<LinkOutlined />}
                          color="blue">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600">
                            {link.text}
                          </a>
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Images */}
          {fileList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fileList.map((file) => (
                <div key={file.uid} className="relative">
                  <img
                    src={file.thumbUrl || file.url}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center rounded-full"
                    onClick={() =>
                      setFileList(fileList.filter((f) => f.uid !== file.uid))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (e.g., lagos, budget-travel)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={handleAddTag}
                prefix="#"
                size="small"
              />
              <Button onClick={handleAddTag} size="small">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    color="green">
                    #{tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Space>
              <Upload
                listType="picture"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                showUploadList={false}
                accept="image/*"
                multiple>
                <Button icon={<PictureOutlined />} size="small">
                  Images
                </Button>
              </Upload>
            </Space>

            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
              className="bg-[#00623B] hover:bg-[#004d2e]">
              Post
            </Button>
          </div>
        </div>
      </Modal>

      {/* Link Modal */}
      <Modal
        title="Add Link"
        open={linkModalOpen}
        onCancel={() => {
          setLinkModalOpen(false);
          setLinkUrl("");
          setLinkText("");
        }}
        onOk={handleAddLink}
        okText="Add Link">
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Link URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            prefix={<LinkOutlined />}
          />
          <Input
            placeholder="Link text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
