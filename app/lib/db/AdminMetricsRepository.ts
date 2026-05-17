import { prisma } from "./prisma";

export interface AdminMetricsSummary {
    users: number;
    posts: number;
    bugReports: number;
    reviews: number;
}

export class AdminMetricsRepository {
    async getSummary(): Promise<AdminMetricsSummary> {
        const [users, posts, bugReports, reviews] = await Promise.all([
            prisma.user.count(),
            prisma.post.count(),
            prisma.bugReport.count(),
            prisma.userReview.count(),
        ]);

        return { users, posts, bugReports, reviews };
    }
}

export const adminMetricsRepository = new AdminMetricsRepository();
