# Maru-Spa

This repository contains a simple ecommerce landing page scaffold and marketplace automation starter for Amazon, Walmart, and Alibaba.

## What is included

- `docs/` — static site ready for GitHub Pages deployment
- `docs/CNAME` — configures the custom domain `maru-spa.com`
- `src/automation/marketplace-search.js` — sample marketplace search automation script
- `package.json` — scripts for running the site locally and automation scripts

## Deploy to GitHub Pages

1. Commit the repository to the `main` branch.
2. In GitHub repo settings, enable GitHub Pages and set the source to the `docs/` folder.
3. GitHub will publish the site at `https://aldebrito05.github.io/Maru-Spa/`.
4. The `docs/CNAME` file maps the site to `maru-spa.com`.

## GoDaddy domain setup

1. Log in to GoDaddy and open DNS management for `maru-spa.com`.
2. Add or update these records:
   - `A` record for `@` pointing to `185.199.108.153`
   - `A` record for `@` pointing to `185.199.109.153`
   - `A` record for `@` pointing to `185.199.110.153`
   - `A` record for `@` pointing to `185.199.111.153`
   - `CNAME` record for `www` pointing to `aldelbrito05.github.io.`
3. Save changes and wait for DNS propagation.

## Run locally

- `npm install`
- `npm run site:start`

## Search marketplace examples

- `npm run walmart:search -- "massage chair"`
- `npm run amazon:search -- "massage chair"`
- `npm run alibaba:search -- "massage chair"`
