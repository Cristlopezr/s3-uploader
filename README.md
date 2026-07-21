# ☁️ S3 Uploader Monorepo

NestJS, React, AWS S3, and CDK with a monorepo architecture (pnpm workspaces).

## Structure
- `apps/api` -> NestJS (Backend)
- `apps/web` -> React + Vite (Frontend)
- `infra/cdk` -> AWS CDK (Infrastructure)

## Dev
Run `pnpm dev` from the root to start both API and Web servers.