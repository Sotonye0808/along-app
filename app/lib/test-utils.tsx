import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ConfigProvider, App, theme } from "antd";

// Mock ThemeProvider for tests (avoids localStorage and mounting delays)
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock AntdProvider for tests (without theme dependency)
const MockAntdProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#00623B",
          borderRadius: 8,
          fontFamily: "Inter, Roboto, system-ui, sans-serif",
        },
        components: {
          Button: {
            controlHeight: 44,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 44,
          },
        },
      }}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

// Mock AuthProvider for tests to avoid real auth calls
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock user data
export const mockUser: User = {
  id: "1",
  userName: "testuser",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  avatar: "/assets/images/avatar-placeholder.png",
  bio: "Test bio",
  followers: 100,
  following: ["2", "3"],
  likes: ["post-1", "post-2"],
  bookmarks: ["post-3"],
  createdAt: new Date().toISOString(),
  verified: true,
  location: "Lagos, Nigeria",
};

// Mock post data
export const mockPost: Post = {
  id: "post-1",
  userId: "1",
  title: "Amazing Journey Through Lagos",
  routes: [
    {
      id: "route-1",
      text: "Start at Lekki Phase 1",
      links: [{ text: "Lekki", url: "https://maps.google.com" }],
      order: 1,
      vehicles: ["car"],
      status: "verified",
      fare: 2000,
    },
    {
      id: "route-2",
      text: "Pass through VI",
      links: [],
      order: 2,
      vehicles: ["bus"],
      status: "verified",
      fare: 500,
    },
  ],
  images: ["/assets/images/post-1.jpg"],
  tags: ["lagos", "travel", "adventure"],
  likes: 50,
  dislikes: 2,
  comments: 10,
  bookmarks: 15,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock comment data
export const mockComment: PostComment = {
  id: "comment-1",
  postId: "post-1",
  userId: "2",
  text: "Great route! Very helpful.",
  createdAt: new Date().toISOString(),
  likes: 5,
  dislikes: 0,
};

// Mock search results
export const mockSearchResults: SearchResult[] = [
  {
    type: "user",
    id: "1",
    title: "Test User",
    subtitle: "@testuser",
    avatar: "/assets/images/avatar-placeholder.png",
    link: "/profile/testuser",
  },
  {
    type: "post",
    id: "post-1",
    title: "Amazing Journey Through Lagos",
    subtitle: "By Test User",
    link: "/posts/post-1",
    metadata: "50 likes • 10 comments",
  },
  {
    type: "tag",
    id: "lagos",
    title: "#lagos",
    subtitle: "25 posts",
    link: "/explore?tag=lagos",
  },
];

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialUser?: User | null;
  theme?: "light" | "dark";
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const {
    initialUser = mockUser,
    theme = "light",
    ...renderOptions
  } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockThemeProvider>
        <MockAntdProvider>
          <MockAuthProvider>{children}</MockAuthProvider>
        </MockAntdProvider>
      </MockThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { screen, waitFor, within, fireEvent } from "@testing-library/react";
export { renderWithProviders as render };

// Mock API responses
export const mockApiResponse = <T,>(data: T): ApiResponse<T> => ({
  data,
  message: "Success",
});

export const mockApiError = (error: string): ApiResponse<null> => ({
  data: null,
  error,
});

export const mockPaginatedResponse = <T,>(
  data: T[],
  page = 1,
  limit = 10
): PaginatedResponse<T> => ({
  data,
  page,
  limit,
  total: data.length,
});

// Wait for async updates
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock fetch responses
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: async () => response,
      text: async () => JSON.stringify(response),
    })
  ) as jest.Mock;
};

// Mock axios responses
export const mockAxiosSuccess = (data: any) => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
});

export const mockAxiosError = (message: string, status = 400) => ({
  response: {
    data: { error: message },
    status,
    statusText: "Error",
    headers: {},
    config: {} as any,
  },
  message,
});

// Helper to create mock form data
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};
