import { env } from "../config/env";

export interface HealthCheckResult {
    ok: boolean;
    data?: any;
    error?: string;
}

export async function checkMicroserviceHealth(): Promise<HealthCheckResult> {
    try {
        const url = env.isProduction
            ? "https://api.twitchcharades.com/health"
            : "http://localhost:3000/health";

        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            return { ok: true, data };
        }

        return { ok: false, error: `HTTP ${response.status}` };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
