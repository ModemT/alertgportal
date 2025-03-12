# Deployment Guide for AlertG Payment Portal

This guide provides instructions for deploying the AlertG Payment Portal to various hosting platforms.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Git

## Build Options

The AlertG Payment Portal can be deployed in two ways:

1. **Node.js Server** - For server-side rendering and API routes
2. **Static Site** - For static hosting platforms

## Option 1: Node.js Server Deployment

### Building for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This will create a `.output` directory with the following structure:
- `.output/public` - Static assets
- `.output/server` - Server code

### Running in Production

```bash
# Start the production server
node .output/server/index.mjs
```

### Deployment Platforms

#### Heroku

1. Create a `Procfile` in the project root:
   ```
   web: node .output/server/index.mjs
   ```

2. Deploy to Heroku:
   ```bash
   heroku create
   git push heroku main
   ```

#### DigitalOcean App Platform

1. Create a new app on DigitalOcean App Platform
2. Connect your GitHub repository
3. Set the build command to `npm run build`
4. Set the run command to `node .output/server/index.mjs`

#### AWS Elastic Beanstalk

1. Create a `.ebextensions/nodecommand.config` file:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "node .output/server/index.mjs"
   ```

2. Deploy to Elastic Beanstalk:
   ```bash
   eb init
   eb create
   eb deploy
   ```

## Option 2: Static Site Deployment

### Building a Static Site

```bash
# Install dependencies
npm install

# Generate static site
npm run generate
```

This will create a `.output/public` directory with all the static files.

### Deployment Platforms

#### Netlify

1. Create a `netlify.toml` file in the project root:
   ```toml
   [build]
     command = "npm run generate"
     publish = ".output/public"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy to Netlify:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   netlify deploy --prod
   ```

#### Vercel

1. Create a `vercel.json` file in the project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "nuxt.config.ts",
         "use": "@nuxtjs/vercel-builder"
       }
     ]
   }
   ```

2. Deploy to Vercel:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel --prod
   ```

#### GitHub Pages

1. Create a GitHub Actions workflow file (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Generate static files
           run: npm run generate

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: .output/public
   ```

2. Push to GitHub and the workflow will automatically deploy your site to GitHub Pages.

## Environment Variables

For production deployments, you may need to set environment variables:

```bash
# Example for Node.js server
NODE_ENV=production PORT=8080 node .output/server/index.mjs
```

## Troubleshooting

- **404 errors on page refresh**: Add proper redirects for your hosting platform to handle client-side routing.
- **API calls not working**: Ensure your API endpoints are properly configured for the deployment environment.
- **Static assets not loading**: Check that the base URL is correctly set in your `nuxt.config.ts` file.

## Performance Optimization

- Enable gzip/Brotli compression on your server
- Set up proper caching headers for static assets
- Consider using a CDN for global distribution 