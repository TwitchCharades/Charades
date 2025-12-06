# Twitch Charades - Electron App

This is the Electron desktop application for Twitch Charades, built with React, TypeScript, and Vite.

## Repository Information

- **Organization:** TwitchCharades
- **Repository:** Charades
- **Type:** Public
- **GitHub:** https://github.com/TwitchCharades/Charades

## Auto-Updater Setup

This application uses `electron-updater` to provide automatic updates from GitHub releases.

### Configuration

Since this is a public repository, no authentication token is required for users to download updates. However, you still need a GitHub token to **publish** releases.

### For Developers - Publishing Releases

1. **Create a GitHub Token:**
    - Go to https://github.com/settings/tokens
    - Click "Generate new token" → "Generate new token (classic)"
    - Name it (e.g., "Electron Release Publisher")
    - Select scope: `repo` (Full control of repositories)
    - Generate and copy the token

2. **Set Environment Variable:**

    ```powershell
    # Windows PowerShell
    $env:GH_TOKEN = "your_github_token_here"

    # macOS/Linux
    export GH_TOKEN="your_github_token_here"
    ```

3. **Build and Publish:**
    ```bash
    pnpm run build
    ```

### Configuration Files

- `dev-app-update.yml` - Development mode updater configuration
- `electron-builder.json5` - Production build and publish configuration

### How Updates Work

1. App checks for updates on startup (3 seconds after launch)
2. If update available, download button appears in title bar
3. Click to download the update
4. Once downloaded, click again to restart and install
5. Updates auto-install on app quit

### Creating Releases

To trigger an update, create a new GitHub release with a version tag higher than the current version in `package.json`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
    // other rules...
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: __dirname,
    },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
