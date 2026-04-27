import { prisma } from "./prisma";

export class SiteConfigRepository {
  async get<T>(key: string): Promise<T | null> {
    try {
      const record = await prisma.siteConfig.findUnique({ where: { key } });
      if (!record) {
        return null;
      }
      return record.value as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const jsonValue = value as object;
    await prisma.siteConfig.upsert({
      where: { key },
      create: { key, value: jsonValue },
      update: { value: jsonValue },
    });
  }

  async delete(key: string): Promise<void> {
    await prisma.siteConfig.delete({ where: { key } }).catch(() => undefined);
  }
}

export const siteConfigRepository = new SiteConfigRepository();
