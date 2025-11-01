"use client";

import React, { useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Dropdown,
  Image as AntImage,
  Tag,
  Space,
  Divider,
  Tooltip,
} from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  BookOutlined,
  MoreOutlined,
  LikeFilled,
  DislikeFilled,
  BookFilled,
  EnvironmentOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import { formatDate, formatNumber } from "@/lib/utils/format";

interface PostCardProps {
  post: Post;
  author: User;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onFollow?: (userId: string) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
}

const vehicleIcons: Record<VehicleType, string> = {
  taxi: "🚕",
  bike: "🏍️",
  keke: "🛺",
  bus: "🚌",
  trekking: "🚶",
  car: "🚗",
};

const statusConfig = {
  verified: {
    icon: CheckCircleOutlined,
    color: "text-green-500",
    tooltip: "Verified Route",
  },
  unverified: {
    icon: ExclamationCircleOutlined,
    color: "text-gray-500",
    tooltip: "Unverified Route",
  },
  pending: {
    icon: ClockCircleOutlined,
    color: "text-yellow-500",
    tooltip: "Pending Verification",
  },
  rejected: {
    icon: CloseCircleOutlined,
    color: "text-red-500",
    tooltip: "Rejected Route",
  },
};

export function PostCard({
  post,
  author,
  currentUserId,
  onLike,
  onDislike,
  onComment,
  onBookmark,
  onShare,
  onEdit,
  onDelete,
  onFollow,
  isLiked = false,
  isDisliked = false,
  isBookmarked = false,
  isFollowing = false,
}: PostCardProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isOwnPost = currentUserId === post.userId;

  const menuItems: MenuProps["items"] = [
    ...(isOwnPost
      ? [
          {
            key: "edit",
            label: "Edit post",
            onClick: () => onEdit?.(post),
          },
          {
            key: "delete",
            label: "Delete post",
            danger: true,
            onClick: () => onDelete?.(post.id),
          },
          {
            type: "divider" as const,
          },
        ]
      : []),
    {
      key: "report",
      label: "Report post",
    },
    {
      key: "hide",
      label: "Hide this post",
    },
    ...(!isOwnPost
      ? [
          {
            key: "follow",
            label: isFollowing
              ? `Unfollow @${author.userName}`
              : `Follow @${author.userName}`,
            onClick: () => onFollow?.(author.id),
          },
        ]
      : []),
  ];

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setImagePreviewOpen(true);
  };

  return (
    <Card
      className="mb-4 hover:shadow-md transition-shadow"
      variant="borderless">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.userName}`}>
            <Avatar
              size={48}
              src={author.avatar}
              className="cursor-pointer hover:opacity-80 transition-opacity">
              {author.firstName[0]}
              {author.lastName[0]}
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Link href={`/profile/${author.userName}`}>
                <h3 className="font-semibold text-gray-900 hover:text-[#00623B] cursor-pointer">
                  {author.firstName} {author.lastName}
                </h3>
              </Link>
              {!isOwnPost && onFollow && (
                <Button
                  type={isFollowing ? "default" : "primary"}
                  size="small"
                  onClick={() => onFollow(author.id)}
                  className={
                    isFollowing
                      ? "border-[#00623B] text-[#00623B] text-sm hover:bg-gray-50"
                      : "bg-[#00623B] hover:bg-[#004d2e]"
                  }>
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
              <span>@{author.userName}</span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      {/* Post Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h2>

      {/* Routes */}
      <div className="space-y-4 mb-4">
        {post.routes.map((route, index) => {
          const StatusIcon = statusConfig[route.status].icon;
          return (
            <div key={route.id} className="flex gap-3">
              {/* Route number indicator */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00623B] text-white flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                {index < post.routes.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300 my-1 flex-1" />
                )}
              </div>

              {/* Route content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-800 flex-1">{route.text}</p>
                  <Tooltip className={`overwrite-anticon-color ${statusConfig[route.status].color}`} title={statusConfig[route.status].tooltip}>
                    <StatusIcon
                      className={`text-sm ml-2 overwrite-anticon-color ${
                        statusConfig[route.status].color
                      }`}
                    />
                  </Tooltip>
                </div>

                {/* Vehicle types and fare */}
                {route.vehicles && route.vehicles.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Space size={4}>
                      {route.vehicles.map((vehicle) => (
                        <span key={vehicle} className="text-xl" title={vehicle}>
                          {vehicleIcons[vehicle]}
                        </span>
                      ))}
                    </Space>
                    {route.fare && (
                      <Tag icon={<DollarOutlined />} color="green">
                        ₦{formatNumber(route.fare)}
                      </Tag>
                    )}
                  </div>
                )}

                {/* Links */}
                {route.links && route.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {route.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#00623B] hover:underline flex items-center gap-1">
                        <EnvironmentOutlined />
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div
          className={`grid gap-2 mb-4 ${
            post.images.length === 1
              ? "grid-cols-1"
              : post.images.length === 2
              ? "grid-cols-2"
              : "grid-cols-2"
          }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(index)}>
              <img
                src={image}
                alt={`${post.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    +{post.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

            {/* Image Preview Modal */}
      <AntImage.PreviewGroup
        preview={{
          visible: imagePreviewOpen,
          onVisibleChange: setImagePreviewOpen,
          current: currentImageIndex,
          onChange: (current) => setCurrentImageIndex(current),
        }}>
        {post.images?.map((image, index) => (
          <AntImage
            key={index}
            src={image}
            style={{ display: 'none' }}
            alt={`${post.title} - Image ${index + 1}`}
          />
        ))}
      </AntImage.PreviewGroup>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Tag key={tag} className="cursor-pointer hover:opacity-80">
              #{tag}
            </Tag>
          ))}
        </div>
      )}

      <Divider className="my-3" />

      {/* Post Actions */}
      <div className="flex items-center justify-between text-gray-600">
        <Space>
          <Button
            type="text"
            icon={
              isLiked ? (
                <LikeFilled className="text-[#00623B]" />
              ) : (
                <LikeOutlined />
              )
            }
            onClick={() => onLike?.(post.id)}
            className={isLiked ? "text-[#00623B]" : ""}>
            {formatNumber(post.likes)}
          </Button>

          <Button
            type="text"
            icon={
              isDisliked ? (
                <DislikeFilled className="text-red-500" />
              ) : (
                <DislikeOutlined />
              )
            }
            onClick={() => onDislike?.(post.id)}
            className={isDisliked ? "text-red-500" : ""}>
            {formatNumber(post.dislikes)}
          </Button>

          <Button
            type="text"
            icon={<CommentOutlined />}
            onClick={() => onComment?.(post.id)}>
            {formatNumber(post.comments)}
          </Button>
        </Space>

        <Space>
          <Button
            type="text"
            icon={
              isBookmarked ? (
                <BookFilled className="text-[#00623B]" />
              ) : (
                <BookOutlined />
              )
            }
            onClick={() => onBookmark?.(post.id)}
            className={isBookmarked ? "text-[#00623B]" : ""}
          />
          <Button
            type="text"
            icon={<ShareAltOutlined />}
            onClick={() => onShare?.(post.id)}></Button>
        </Space>
      </div>
    </Card>
  );
}
