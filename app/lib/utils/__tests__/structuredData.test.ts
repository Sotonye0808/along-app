import {
    generateOrganizationSchema,
    generateWebSiteSchema,
    generateArticleSchema,
    generatePersonSchema,
    generateBreadcrumbSchema,
} from '../structuredData'

describe('structuredData.ts utility functions', () => {
    const baseUrl = 'https://along.example.com'

    const mockPost: Post = {
        id: 'post-1',
        userId: 'user-1',
        title: 'Amazing Journey Through Lagos',
        routes: [
            {
                id: 'route-1',
                text: 'Start at Lekki Phase 1 and enjoy the scenic coastal views',
                links: [{ text: 'Lekki', url: 'https://maps.google.com' }],
                order: 1,
                vehicles: ['car'],
                status: 'verified',
                fare: 2000,
            },
        ],
        images: ['/assets/images/post-1.jpg', '/assets/images/post-2.jpg'],
        tags: ['lagos', 'travel', 'adventure'],
        likes: 50,
        dislikes: 2,
        comments: 10,
        bookmarks: 15,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T12:00:00Z',
    }

    const mockUser: User = {
        id: 'user-1',
        userName: 'traveler123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        avatar: '/assets/images/john-avatar.jpg',
        bio: 'Travel enthusiast exploring Africa',
        followers: 500,
        following: ['user-2', 'user-3'],
        likes: ['post-1', 'post-2'],
        bookmarks: ['post-3'],
        createdAt: '2023-01-01T00:00:00Z',
        verified: true,
        location: 'Lagos, Nigeria',
    }

    describe('generateOrganizationSchema', () => {
        it('should generate valid organization schema', () => {
            const schema = generateOrganizationSchema(baseUrl)

            expect(schema).toEqual({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Along',
                url: baseUrl,
                logo: `${baseUrl}/assets/images/logo.png`,
                description: 'Discover and share amazing travel routes with the Along community',
                sameAs: ['https://twitter.com/along_app'],
            })
        })

        it('should include the correct logo URL', () => {
            const schema = generateOrganizationSchema(baseUrl)

            expect(schema.logo).toBe(`${baseUrl}/assets/images/logo.png`)
        })
    })

    describe('generateWebSiteSchema', () => {
        it('should generate valid website schema', () => {
            const schema = generateWebSiteSchema(baseUrl)

            expect(schema['@context']).toBe('https://schema.org')
            expect(schema['@type']).toBe('WebSite')
            expect(schema.name).toBe('Along')
            expect(schema.url).toBe(baseUrl)
        })

        it('should include search action', () => {
            const schema = generateWebSiteSchema(baseUrl)

            expect(schema.potentialAction).toEqual({
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${baseUrl}/explore?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
            })
        })
    })

    describe('generateArticleSchema', () => {
        it('should generate valid article schema', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema['@context']).toBe('https://schema.org')
            expect(schema['@type']).toBe('Article')
            expect(schema.headline).toBe(mockPost.title)
            expect(schema.datePublished).toBe(mockPost.createdAt)
            expect(schema.dateModified).toBe(mockPost.updatedAt)
        })

        it('should use first route text as description', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema.description).toBe(
                'Start at Lekki Phase 1 and enjoy the scenic coastal views'
            )
        })

        it('should truncate description to 200 characters', () => {
            const longPost = {
                ...mockPost,
                routes: [
                    {
                        ...mockPost.routes[0],
                        text: 'a'.repeat(300),
                    },
                ],
            }

            const schema = generateArticleSchema(longPost, mockUser, baseUrl)

            expect(schema.description.length).toBe(200)
        })

        it('should use title as description if no routes', () => {
            const noRoutesPost = { ...mockPost, routes: [] }

            const schema = generateArticleSchema(noRoutesPost, mockUser, baseUrl)

            expect(schema.description).toBe(mockPost.title)
        })

        it('should include post images', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema.image).toEqual(mockPost.images)
        })

        it('should fallback to OG image if no post images', () => {
            const noImagesPost = { ...mockPost, images: [] }

            const schema = generateArticleSchema(noImagesPost, mockUser, baseUrl)

            expect(schema.image).toEqual([`${baseUrl}/assets/images/og-image.png`])
        })

        it('should include author information', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema.author).toEqual({
                '@type': 'Person',
                name: 'John Doe',
                url: `${baseUrl}/profile/${mockUser.userName}`,
            })
        })

        it('should include publisher information', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema.publisher).toEqual({
                '@type': 'Organization',
                name: 'Along',
                logo: {
                    '@type': 'ImageObject',
                    url: `${baseUrl}/assets/images/logo.png`,
                },
            })
        })

        it('should include interaction statistics', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema.interactionStatistic).toEqual([
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/LikeAction',
                    userInteractionCount: 50,
                },
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/CommentAction',
                    userInteractionCount: 10,
                },
            ])
        })

        it('should include keywords from tags', () => {
            const schema = generateArticleSchema(mockPost, mockUser, baseUrl)

            expect(schema.keywords).toBe('lagos, travel, adventure')
        })
    })

    describe('generatePersonSchema', () => {
        it('should generate valid person schema', () => {
            const schema = generatePersonSchema(mockUser, baseUrl)

            expect(schema['@context']).toBe('https://schema.org')
            expect(schema['@type']).toBe('Person')
            expect(schema.name).toBe('John Doe')
            expect(schema.alternateName).toBe(mockUser.userName)
            expect(schema.url).toBe(`${baseUrl}/profile/${mockUser.userName}`)
        })

        it('should include user avatar', () => {
            const schema = generatePersonSchema(mockUser, baseUrl)

            expect(schema.image).toBe(mockUser.avatar)
        })

        it('should fallback to default avatar if not provided', () => {
            const noAvatarUser = { ...mockUser, avatar: undefined }

            const schema = generatePersonSchema(noAvatarUser, baseUrl)

            expect(schema.image).toBe(`${baseUrl}/assets/images/default-avatar.png`)
        })

        it('should include user bio', () => {
            const schema = generatePersonSchema(mockUser, baseUrl)

            expect(schema.description).toBe(mockUser.bio)
        })

        it('should have default bio if not provided', () => {
            const noBioUser = { ...mockUser, bio: undefined }

            const schema = generatePersonSchema(noBioUser, baseUrl)

            expect(schema.description).toBe(
                'Travel enthusiast sharing routes and experiences on Along'
            )
        })

        it('should include follower count', () => {
            const schema = generatePersonSchema(mockUser, baseUrl)

            expect(schema.interactionStatistic).toEqual({
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/FollowAction',
                userInteractionCount: 500,
            })
        })

        it('should default to 0 followers if not provided', () => {
            const noFollowersUser = { ...mockUser, followers: undefined }

            const schema = generatePersonSchema(noFollowersUser, baseUrl)

            expect(schema.interactionStatistic.userInteractionCount).toBe(0)
        })
    })

    describe('generateBreadcrumbSchema', () => {
        it('should generate valid breadcrumb schema', () => {
            const items = [
                { name: 'Home', url: '/' },
                { name: 'Explore', url: '/explore' },
                { name: 'Post', url: '/posts/post-1' },
            ]

            const schema = generateBreadcrumbSchema(items, baseUrl)

            expect(schema['@context']).toBe('https://schema.org')
            expect(schema['@type']).toBe('BreadcrumbList')
        })

        it('should include all breadcrumb items', () => {
            const items = [
                { name: 'Home', url: '/' },
                { name: 'Profile', url: '/profile' },
            ]

            const schema = generateBreadcrumbSchema(items, baseUrl)

            expect(schema.itemListElement).toHaveLength(2)
            expect(schema.itemListElement[0]).toEqual({
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/`,
            })
            expect(schema.itemListElement[1]).toEqual({
                '@type': 'ListItem',
                position: 2,
                name: 'Profile',
                item: `${baseUrl}/profile`,
            })
        })

        it('should handle single breadcrumb item', () => {
            const items = [{ name: 'Home', url: '/' }]

            const schema = generateBreadcrumbSchema(items, baseUrl)

            expect(schema.itemListElement).toHaveLength(1)
            expect(schema.itemListElement[0].position).toBe(1)
        })

        it('should maintain correct position order', () => {
            const items = [
                { name: 'First', url: '/first' },
                { name: 'Second', url: '/second' },
                { name: 'Third', url: '/third' },
            ]

            const schema = generateBreadcrumbSchema(items, baseUrl)

            schema.itemListElement.forEach((item: any, index: number) => {
                expect(item.position).toBe(index + 1)
            })
        })

        it('should handle empty items array', () => {
            const schema = generateBreadcrumbSchema([], baseUrl)

            expect(schema.itemListElement).toEqual([])
        })
    })
})
