export type ProjectEnv = "development" | "production" | "test" | "staging";

const RAW_PROJECT_ENV = (process.env.PROJECT_ENV || process.env.NODE_ENV || "development").toLowerCase();

export function getProjectEnv(): ProjectEnv {
    if (RAW_PROJECT_ENV === "production") return "production";
    if (RAW_PROJECT_ENV === "test") return "test";
    if (RAW_PROJECT_ENV === "staging") return "staging";
    return "development";
}

export function isProjectDev(): boolean {
    return getProjectEnv() === "development";
}

export function getCloudinaryFolderPrefix(): string {
    return isProjectDev() ? "along/dev" : "along";
}

export function getCacheKeyPrefix(): string {
    return isProjectDev() ? "dev:" : "";
}
