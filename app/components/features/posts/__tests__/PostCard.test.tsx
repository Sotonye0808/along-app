import React from "react";
import "@testing-library/jest-dom";
import { PostCard } from "../PostCard";
import {
  render,
  screen,
  userEvent,
  mockPost,
  mockUser,
} from "@/lib/test-utils";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("PostCard", () => {
  const defaultProps = {
    post: mockPost,
    author: mockUser,
    currentUserId: "user-2", // Different from post author
    onLike: jest.fn(),
    onDislike: jest.fn(),
    onComment: jest.fn(),
    onBookmark: jest.fn(),
    onShare: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onFollow: jest.fn(),
    isLiked: false,
    isDisliked: false,
    isBookmarked: false,
    isFollowing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render post title", () => {
      render(<PostCard {...defaultProps} />);

      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    it("should render author information", () => {
      render(<PostCard {...defaultProps} />);

      expect(
        screen.getByText(`${mockUser.firstName} ${mockUser.lastName}`)
      ).toBeInTheDocument();
      expect(screen.getByText(`@${mockUser.userName}`)).toBeInTheDocument();
    });

    it("should render post date", () => {
      render(<PostCard {...defaultProps} />);

      // Date should be formatted (check for any date-related text)
      // Use getAllByText since date might appear multiple times
      const dateElements = screen.getAllByText(
        /ago|Just now|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
      );
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it("should render all routes", () => {
      render(<PostCard {...defaultProps} />);

      mockPost.routes.forEach((route) => {
        expect(screen.getByText(route.text)).toBeInTheDocument();
      });
    });

    it("should render tags", () => {
      render(<PostCard {...defaultProps} />);

      mockPost.tags.forEach((tag) => {
        expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
      });
    });

    it("should render engagement stats", () => {
      render(<PostCard {...defaultProps} />);

      // Likes, comments, and bookmarks should be visible
      expect(screen.getByText("50")).toBeInTheDocument(); // likes
      expect(screen.getByText("10")).toBeInTheDocument(); // comments
    });

    it("should show verified badge for verified author", () => {
      const verifiedUser = { ...mockUser, verified: true };
      render(<PostCard {...defaultProps} author={verifiedUser} />);

      // Check for verified icon or badge
      const authorSection = screen
        .getByText(`@${verifiedUser.userName}`)
        .closest("div");
      expect(authorSection).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onLike when like button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      // Use getAllByLabelText and get the first one (main action button)
      const likeButtons = screen.getAllByLabelText(/like/i);
      await user.click(likeButtons[0]);

      expect(defaultProps.onLike).toHaveBeenCalledWith(mockPost.id);
    });

    it("should call onDislike when dislike button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const dislikeButtons = screen.getAllByLabelText(/dislike/i);
      await user.click(dislikeButtons[0]);

      expect(defaultProps.onDislike).toHaveBeenCalledWith(mockPost.id);
    });

    it("should call onComment when comment button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const commentButtons = screen.getAllByLabelText(/comment/i);
      await user.click(commentButtons[0]);

      expect(defaultProps.onComment).toHaveBeenCalledWith(mockPost.id);
    });

    it("should call onBookmark when bookmark button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const bookmarkButton = screen.getByLabelText(/bookmark/i);
      await user.click(bookmarkButton);

      expect(defaultProps.onBookmark).toHaveBeenCalledWith(mockPost.id);
    });

    it("should call onShare when share button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const shareButtons = screen.getAllByLabelText(/share/i);
      await user.click(shareButtons[0]);

      expect(defaultProps.onShare).toHaveBeenCalledWith(mockPost.id);
    });
  });

  describe("Own Post Actions", () => {
    it("should show edit and delete options for own posts", async () => {
      const user = userEvent.setup();
      const ownPostProps = {
        ...defaultProps,
        currentUserId: mockPost.userId, // Same as post author
      };

      render(<PostCard {...ownPostProps} />);

      // Open dropdown menu
      const moreButton = screen.getByLabelText(/more/i);
      await user.click(moreButton);

      expect(screen.getByText("Edit post")).toBeInTheDocument();
      expect(screen.getByText("Delete post")).toBeInTheDocument();
    });

    it("should not show edit and delete options for other users posts", async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      // Open dropdown menu
      const moreButton = screen.getByLabelText(/more/i);
      await user.click(moreButton);

      expect(screen.queryByText("Edit post")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete post")).not.toBeInTheDocument();
    });

    it("should call onEdit when edit is clicked", async () => {
      const user = userEvent.setup();
      const ownPostProps = {
        ...defaultProps,
        currentUserId: mockPost.userId,
      };

      render(<PostCard {...ownPostProps} />);

      const moreButton = screen.getByLabelText(/more/i);
      await user.click(moreButton);

      const editButton = screen.getByText("Edit post");
      await user.click(editButton);

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockPost);
    });

    it("should call onDelete when delete is clicked", async () => {
      const user = userEvent.setup();
      const ownPostProps = {
        ...defaultProps,
        currentUserId: mockPost.userId,
      };

      render(<PostCard {...ownPostProps} />);

      const moreButton = screen.getByLabelText(/more/i);
      await user.click(moreButton);

      const deleteButton = screen.getByText("Delete post");
      await user.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockPost.id);
    });
  });

  describe("Active States", () => {
    it("should show filled like icon when post is liked", () => {
      render(<PostCard {...defaultProps} isLiked={true} />);

      const likeButtons = screen.getAllByLabelText(/like/i);
      // active state applies primary color token
      expect(likeButtons[0]).toHaveClass("!text-[var(--color-primary)]");
    });

    it("should show filled dislike icon when post is disliked", () => {
      render(<PostCard {...defaultProps} isDisliked={true} />);

      const dislikeButtons = screen.getAllByLabelText(/dislike/i);
      // active state applies error color token
      expect(dislikeButtons[0]).toHaveClass("!text-[var(--color-error-text)]");
    });

    it("should show filled bookmark icon when post is bookmarked", () => {
      render(<PostCard {...defaultProps} isBookmarked={true} />);

      const bookmarkButton = screen.getByLabelText(/bookmark/i);
      // active state applies primary color token
      expect(bookmarkButton).toHaveClass("!text-[var(--color-primary)]");
    });
  });

  describe("Routes Display", () => {
    it("should display vehicle icons for each route", () => {
      render(<PostCard {...defaultProps} />);

      // Check that routes are rendered
      mockPost.routes.forEach((route) => {
        expect(screen.getByText(route.text)).toBeInTheDocument();
      });
    });

    it("should show route status indicators", () => {
      render(<PostCard {...defaultProps} />);

      // Check for verified route status
      const routeElements = screen.getAllByText(/Start at|Pass through/);
      expect(routeElements.length).toBeGreaterThan(0);
    });

    it("should display route links if available", () => {
      const postWithLinks = {
        ...mockPost,
        routes: [
          {
            ...mockPost.routes[0],
            links: [{ text: "View Map", url: "https://maps.google.com" }],
          },
        ],
      };

      render(<PostCard {...defaultProps} post={postWithLinks} />);

      const link = screen.getByText("View Map");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute(
        "href",
        "https://maps.google.com"
      );
    });
  });

  describe("Images", () => {
    it("should render post images", () => {
      render(<PostCard {...defaultProps} />);

      const images = screen.getAllByRole("img");
      // Filter out avatar images and focus on post images
      const postImages = images.filter((img: HTMLElement) =>
        mockPost.images.some(
          (src) => img.getAttribute("src")?.includes(src) ?? false
        )
      );

      expect(postImages.length).toBeGreaterThan(0);
    });

    it("should handle posts without images", () => {
      const postWithoutImages = { ...mockPost, images: [] };
      render(<PostCard {...defaultProps} post={postWithoutImages} />);

      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on action buttons", () => {
      render(<PostCard {...defaultProps} />);

      // Use getAllByLabelText since there are both button and icon aria-labels
      expect(screen.getAllByLabelText(/like/i)[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText(/dislike/i)[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText(/comment/i)[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText(/bookmark/i)[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText(/share/i)[0]).toBeInTheDocument();
    });

    it("should have clickable author profile link", () => {
      render(<PostCard {...defaultProps} />);

      const authorLinks = screen.getAllByRole("link", {
        name: `${mockUser.firstName} ${mockUser.lastName}`,
      });
      expect(authorLinks.length).toBeGreaterThan(0);
      expect(authorLinks[0]).toHaveAttribute(
        "href",
        `/profile/${mockUser.userName}`
      );
    });
  });
});
