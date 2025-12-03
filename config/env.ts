import { config } from "dotenv";
import { resolve } from "node:path";
import { app } from "electron";
import { z } from "zod";

const projectRoot = app.getAppPath();
const nodeEnv = process.env.NODE_ENV || "development";

// Load environment-specific file first
config({
    path: resolve(projectRoot, `.env.${nodeEnv}`),
    override: false, // Don't override existing environment variables
});

// Load local overrides
config({
    path: resolve(projectRoot, ".env.local"),
    override: false,
});

// Load fallback .env file (for backward compatibility)
config({
    path: resolve(projectRoot, ".env"),
    override: false,
});

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof EnvSchema> & {
    isProduction: boolean;
    VITE_DEV_SERVER_URL: string;
    VITE_PUBLIC: string;
    MAIN_DIST: string;
    RENDERER_DIST: string;
    APP_ROOT: string;
};
const parsedEnv = EnvSchema.parse(process.env);
export const env: Env = {
    ...parsedEnv,
    isProduction: parsedEnv.NODE_ENV === "production",
    VITE_DEV_SERVER_URL: process.env["VITE_DEV_SERVER_URL"] || "",
    VITE_PUBLIC: process.env["VITE_DEV_SERVER_URL"]
        ? resolve(projectRoot, "public")
        : resolve(projectRoot, "dist"),
    MAIN_DIST: resolve(projectRoot, "dist-electron"),
    RENDERER_DIST: resolve(projectRoot, "dist"),
    APP_ROOT: projectRoot,
};
