# Contributing to Ellix Connect

Thank you for your interest in contributing to **Ellix Connect**! This document outlines the workflow, engineering standards, and verification steps required for all contributions.

---

## Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/<your-username>/ellix-connect.git
   cd ellix-connect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Start Local Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## Engineering & Operational Rules

Please review [`AGENTS.md`](./AGENTS.md) before making changes. All pull requests must adhere to these core principles:

1. **Minimal & Scoped Changes**: Only modify files directly related to the issue or feature being addressed. Avoid unrelated refactoring or reformatting.
2. **Design System Consistency**: Preserve the established color palette, typography (`Plus Jakarta Sans` and `JetBrains Mono`), spacing scale, and motion transitions.
3. **TypeScript Strictness**: Use explicit TypeScript types and interfaces (`src/types.ts`). Avoid untyped globals and ensure `npm run lint` passes with zero errors.
4. **Performance & Bundle Hygiene**:
   - Keep heavy dashboard modules lazy-loaded in `src/App.tsx`.
   - Do not introduce eager imports of large libraries (`jspdf`, `recharts`) into the public landing page bundle.
5. **Security & Secrets**:
   - Never commit `.env` files, private keys, or API secrets.
   - Any changes to data access patterns must be reflected and validated in `supabase/migrations/0002_rls.sql` (Row Level Security).

---

## Pre-Submission Checklist

Before opening a Pull Request, run the verification suite locally:

```bash
# 1. Type-check the entire project
npm run lint

# 2. Verify production build and Terser minification succeed
npm run build
```

---

## Pull Request Process

1. Create a descriptive feature or fix branch (`feat/short-description` or `fix/short-description`).
2. Ensure all checks in the Pre-Submission Checklist pass.
3. Complete the Pull Request template, listing every modified file and the reason for each change.
