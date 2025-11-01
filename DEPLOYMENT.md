# 🚀 GitHub Pages Deployment

This document explains how the Atlas Debug Suite demo is automatically deployed to GitHub Pages.

## 📍 Live Demo URL

**https://vziatkov.github.io/atlas-debug-suite/**

## 🔄 Automatic Deployment

The demo is automatically built and deployed when changes are pushed to the `main` branch.

### Trigger Conditions

The deployment workflow triggers when any of these files change:
- `demo/**` - Demo HTML and assets
- `src/**` - Source TypeScript files
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies

### Deployment Process

1. **Build Phase**
   - Installs Node.js 20 and npm dependencies
   - Runs `npm run build` to compile TypeScript and bundle assets
   - Outputs production-ready files to `dist/` folder

2. **Deploy Phase**
   - Uploads built files as GitHub Pages artifact
   - Deploys artifact to GitHub Pages using official actions
   - Changes are live within 1-2 minutes

## 🔧 Configuration Files

### `vite.config.ts`
- Configures root as `./demo` folder
- Sets base path to `/atlas-debug-suite/`
- Outputs to `../dist` relative to demo folder
- Handles TypeScript compilation and asset bundling

### `.github/workflows/demo.yml`
- GitHub Actions workflow for CI/CD
- Uses official GitHub Pages actions (`actions/upload-pages-artifact` and `actions/deploy-pages`)
- Includes proper permissions for GitHub Pages
- Implements concurrency controls
- Split into separate build and deploy jobs for better reliability

## 🛠️ Local Testing

To test the build locally:

```bash
# Install dependencies
npm install

# Build the demo
npm run build

# Preview the built demo
npm run preview
```

The preview will be available at: `http://localhost:4173/atlas-debug-suite/`

## 📦 Build Output

The build process:
- Compiles TypeScript to JavaScript
- Bundles all dependencies
- Minifies and optimizes code
- Generates CSS from source styles
- Outputs everything to `dist/` folder

Build artifacts are:
- `dist/index.html` - Main HTML file
- `dist/assets/*.js` - Bundled JavaScript
- `dist/assets/*.css` - Bundled styles

## 🔐 Permissions

The workflow requires these GitHub token permissions:
- `contents: read` - Read repository files
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC token for deployment

These are configured in the workflow file and granted automatically by GitHub Actions.

## 🐛 Troubleshooting

### Build Fails
- Check that `package.json` dependencies are correct
- Ensure `vite.config.ts` is valid
- Verify TypeScript files compile without errors

### Deployment Fails
- Verify GitHub Pages is enabled in repository settings (Settings → Pages)
- Ensure "Source" is set to "GitHub Actions" (not "Deploy from a branch")
- Check workflow has proper permissions
- Verify the workflow completed successfully in the Actions tab

### Site Not Loading
- Wait 1-2 minutes after deployment completes
- Check GitHub Pages settings in repository
- Verify the base path in `vite.config.ts` matches repository name
- Clear browser cache

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
