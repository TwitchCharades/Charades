import { useState, useEffect } from "react";

interface User {
    twitchId: string;
    displayName: string;
    username: string;
    email?: string;
    profilePicture: string;
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
    tokenObtainedAt?: string;
    authData?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UseAuthReturn {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (window.electronAPI?.auth) {
                const result = await window.electronAPI.auth.get();

                if (result.success && result.user) {
                    setUser(result.user);
                    setIsAuthenticated(result.authenticated);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    if (result.error) {
                        setError(result.error);
                    }
                }
            } else {
                setError("Authentication API not available");
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch user");
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        refetch: fetchUser,
    };
};
