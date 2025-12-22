import { useState, useEffect } from "react";

export function useNewPostsNotification(
    posts: Post[],
    checkForNewPosts: (currentCount: number) => Promise<boolean>
) {
    const [scrolledDown, setScrolledDown] = useState(false);
    const [hasNewPosts, setHasNewPosts] = useState(false);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setScrolledDown(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check for new posts periodically when user has scrolled down
    useEffect(() => {
        if (!scrolledDown) {
            setHasNewPosts(false);
            return;
        }

        const checkNewPosts = async () => {
            const hasNew = await checkForNewPosts(posts.length);
            setHasNewPosts(hasNew);
        };

        // Check every 30 seconds
        const interval = setInterval(checkNewPosts, 30000);
        return () => clearInterval(interval);
    }, [scrolledDown, posts.length, checkForNewPosts]);

    const handleLoadNewPosts = (onLoad: () => Promise<void>) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setHasNewPosts(false);
        onLoad();
    };

    return {
        scrolledDown,
        hasNewPosts,
        handleLoadNewPosts,
    };
}
