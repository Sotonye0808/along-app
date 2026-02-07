/**
 * Mock Redis Implementation for Local Development
 * 
 * This provides an in-memory cache that mimics Redis behavior
 * without requiring an actual Redis server connection.
 * Use this for local development to avoid hitting Upstash free tier limits.
 */

class MockRedis {
    private store: Map<string, { value: any; expiry: number | null }> = new Map();
    private sortedSets: Map<string, Map<string, number>> = new Map();

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        const item = this.store.get(key);

        if (!item) {
            return null;
        }

        // Check if expired
        if (item.expiry && Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        return item.value as T;
    }

    /**
     * Set value in cache with optional TTL
     */
    async set(key: string, value: any, options?: { ex?: number; px?: number }): Promise<'OK'> {
        let expiry: number | null = null;

        if (options?.ex) {
            expiry = Date.now() + options.ex * 1000;
        } else if (options?.px) {
            expiry = Date.now() + options.px;
        }

        this.store.set(key, { value, expiry });
        return 'OK';
    }

    /**
     * Set value with expiry in seconds (Redis SETEX command)
     */
    async setex(key: string, seconds: number, value: any): Promise<'OK'> {
        const expiry = Date.now() + seconds * 1000;
        this.store.set(key, { value, expiry });
        return 'OK';
    }

    /**
     * Delete key(s) from cache
     */
    async del(...keys: string[]): Promise<number> {
        let deleted = 0;
        for (const key of keys) {
            if (this.store.delete(key)) {
                deleted++;
            }
            if (this.sortedSets.delete(key)) {
                deleted++;
            }
        }
        return deleted;
    }

    /**
     * Increment counter
     */
    async incr(key: string): Promise<number> {
        const current = await this.get<number>(key);
        const newValue = (current || 0) + 1;
        await this.set(key, newValue);
        return newValue;
    }

    /**
     * Set expiry on key
     */
    async expire(key: string, seconds: number): Promise<number> {
        const item = this.store.get(key);

        if (!item) {
            return 0;
        }

        item.expiry = Date.now() + seconds * 1000;
        return 1;
    }

    /**
     * Get time to live for key
     */
    async ttl(key: string): Promise<number> {
        const item = this.store.get(key);

        if (!item) {
            return -2; // Key doesn't exist
        }

        if (!item.expiry) {
            return -1; // No expiry set
        }

        const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }

    /**
     * Add member to sorted set (supports both object and parameter formats)
     */
    async zadd(key: string, scoreOrOptions: number | { score: number; member: string }, member?: string): Promise<number> {
        let set = this.sortedSets.get(key);

        if (!set) {
            set = new Map();
            this.sortedSets.set(key, set);
        }

        let actualScore: number;
        let actualMember: string;

        // Handle both formats: zadd(key, score, member) or zadd(key, {score, member})
        if (typeof scoreOrOptions === 'object') {
            actualScore = scoreOrOptions.score;
            actualMember = scoreOrOptions.member;
        } else {
            actualScore = scoreOrOptions;
            actualMember = member!;
        }

        const isNew = !set.has(actualMember);
        set.set(actualMember, actualScore);
        return isNew ? 1 : 0;
    }

    /**
     * Get score of member in sorted set
     */
    async zscore(key: string, member: string): Promise<number | null> {
        const set = this.sortedSets.get(key);
        return set?.get(member) ?? null;
    }

    /**
     * Remove members from sorted set by score range
     */
    async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
        const set = this.sortedSets.get(key);

        if (!set) {
            return 0;
        }

        let removed = 0;
        for (const [member, score] of set.entries()) {
            if (score >= min && score <= max) {
                set.delete(member);
                removed++;
            }
        }

        return removed;
    }

    /**
     * Get number of members in sorted set
     */
    async zcard(key: string): Promise<number> {
        const set = this.sortedSets.get(key);
        return set?.size ?? 0;
    }

    /**
     * Get members from sorted set by score range
     */
    async zrangebyscore(
        key: string,
        min: number,
        max: number,
        options?: { withScores?: boolean }
    ): Promise<any[]> {
        const set = this.sortedSets.get(key);

        if (!set) {
            return [];
        }

        const results: any[] = [];
        for (const [member, score] of set.entries()) {
            if (score >= min && score <= max) {
                if (options?.withScores) {
                    results.push(member, score);
                } else {
                    results.push(member);
                }
            }
        }

        return results;
    }

    /**
     * Clear all data (useful for testing)
     */
    async flushall(): Promise<'OK'> {
        this.store.clear();
        this.sortedSets.clear();
        return 'OK';
    }

    /**
     * Check if key exists
     */
    async exists(...keys: string[]): Promise<number> {
        let count = 0;
        for (const key of keys) {
            if (this.store.has(key) || this.sortedSets.has(key)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Get keys matching pattern (simplified pattern matching)
     */
    async keys(pattern: string): Promise<string[]> {
        const allKeys = Array.from(this.store.keys()).concat(Array.from(this.sortedSets.keys()));

        // Simple pattern matching: convert Redis pattern to regex
        // * matches any characters, ? matches single character
        const regexPattern = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
            .replace(/\*/g, '.*')  // * becomes .*
            .replace(/\?/g, '.');   // ? becomes .

        const regex = new RegExp(`^${regexPattern}$`);

        return allKeys.filter(key => regex.test(key));
    }

    /**
     * Get members from sorted set by index range
     */
    async zrange(
        key: string,
        start: number,
        stop: number,
        options?: { withScores?: boolean }
    ): Promise<any[]> {
        const set = this.sortedSets.get(key);

        if (!set) {
            return [];
        }

        // Convert map to array and sort by score
        const sorted = Array.from(set.entries()).sort((a, b) => a[1] - b[1]);

        // Handle negative indices (count from end)
        const length = sorted.length;
        let startIdx = start < 0 ? Math.max(0, length + start) : start;
        let stopIdx = stop < 0 ? length + stop : stop;

        // Clamp to valid range
        startIdx = Math.max(0, startIdx);
        stopIdx = Math.min(length - 1, stopIdx);

        // Get slice
        const slice = sorted.slice(startIdx, stopIdx + 1);

        if (options?.withScores) {
            const result: any[] = [];
            for (const [member, score] of slice) {
                result.push(member, score);
            }
            return result;
        }

        return slice.map(([member]) => member);
    }
}

// Export singleton instance
export const mockRedis = new MockRedis();
