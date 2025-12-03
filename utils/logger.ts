import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
    level: env.isProduction ? "info" : "debug",
    formatters: {
        level: label => {
            return { level: label };
        }
    },
    base: {
        env: env.NODE_ENV
    }
});

export function createChildLogger(context: Record<string, any>) {
    return logger.child(context);
}
