import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Lineicons } from "@lineiconshq/react-lineicons";
import { TwitchOutlined } from "@lineiconshq/free-icons";

const AuthPage = () => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleTwitchAuth = async () => {
        setIsAuthenticating(true);
        setError(null);

        try {
            if (window.electronAPI?.auth) {
                const result = await window.electronAPI.auth.init();
                if (!result.success) {
                    throw new Error(result.error || "Failed to initiate authentication");
                }
            } else {
                setError(
                    "Authentication API not available. Please make sure you are running the app in Electron."
                );
                setIsAuthenticating(false);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            setError(err instanceof Error ? err.message : "Authentication failed");
            setIsAuthenticating(false);
        }
    };

    return (
        <div
            className="
        h-full flex items-center justify-center
      "
        >
            <div
                className="
          w-full max-w-md
          rounded-2xl
          bg-linear-to-b from-[#1f2024] to-[#18191c]
          border border-[#ffffff0a]
          shadow-[0_18px_45px_rgba(0,0,0,0.55)]
          px-6 py-7
          text-(--text-primary)
          space-y-6
        "
            >
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-2">
                        <div
                            className="
                h-12 w-12 
                rounded-3xl 
                bg-(--primary)
                flex items-center justify-center
                shadow-[0_8px_20px_rgba(0,0,0,0.6)]
              "
                        >
                            <Lineicons icon={TwitchOutlined} size={24} color="white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">Welcome to Twitch Charades</h2>
                    <p className="text-sm text-(--text-secondary) max-w-sm mx-auto">
                        Connect your Twitch account to set up the bot, manage your settings, and
                        start playing with your chat.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="
              rounded-md 
              border border-[#f04747]/60 
              bg-[#2b1518]
              px-4 py-3
              text-sm
              text-red-100
            "
                    >
                        <strong className="font-semibold">Something went wrong:</strong>
                        <span className="block mt-1">{error}</span>
                    </div>
                )}

                {/* Button */}
                <div className="text-center">
                    <button
                        onClick={handleTwitchAuth}
                        disabled={isAuthenticating}
                        className="
              w-full
              flex items-center justify-center
              px-4 py-3
              rounded-md
              text-sm font-medium
              text-white
              bg-(--primary)
              hover:brightness-110
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-(--primary)
              focus:ring-offset-[#111318]
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
                    >
                        {isAuthenticating ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 mr-3"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Complete sign-in in your browser…
                            </>
                        ) : (
                            <>
                                <Lineicons
                                    icon={TwitchOutlined}
                                    size={20}
                                    color="white"
                                    className="mr-2"
                                />
                                Sign in with Twitch
                            </>
                        )}
                    </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-center text-(--text-secondary) leading-relaxed">
                    Only your basic Twitch profile and channel permissions are used. Everything is
                    stored *locally* on your device — never uploaded.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
