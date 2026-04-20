// JSON-LD structured data utilities for SEO

export function generateOrganizationSchema(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Along',
        url: baseUrl,
        logo: `${baseUrl}/assets/images/logo.png`,
        description: 'Discover and share amazing travel routes with the Along community',
        sameAs: [
            'https://twitter.com/along_app',
            // Add other social media links as they become available
        ],
    };
}

export function generateWebSiteSchema(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Along',
        url: baseUrl,
        description: 'Discover and share amazing travel routes with the Along community',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/explore?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function generateArticleSchema(
    post: Post,
    author: User,
    baseUrl: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.routes.length > 0 ? post.routes[0].text.substring(0, 200) : post.title,
        image: post.images.length > 0 ? post.images : [`${baseUrl}/assets/images/og-image.png`],
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        author: {
            '@type': 'Person',
            name: `${author.firstName} ${author.lastName}`,
            url: `${baseUrl}/profile/${author.userName}`,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Along',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/assets/images/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/posts/${post.id}`,
        },
        keywords: post.tags.join(', '),
        articleSection: 'Travel',
        interactionStatistic: [
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: post.likes,
            },
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/CommentAction',
                userInteractionCount: post.comments,
            },
        ],
    };
}

export function generatePersonSchema(user: User, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: `${user.firstName} ${user.lastName}`,
        alternateName: user.userName,
        url: `${baseUrl}/profile/${user.userName}`,
        image: user.avatar || `${baseUrl}/assets/images/default-avatar.png`,
        description: user.bio || `Travel enthusiast sharing routes and experiences on Along`,
        interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/FollowAction',
            userInteractionCount: user.followers || 0,
        },
    };
}

export function generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>,
    baseUrl: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
        })),
    };
}
