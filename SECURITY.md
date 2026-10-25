# Security Policy

## Supported Versions

Ellix Connect is actively maintained as a continuous web deployment. Security updates are applied directly to the latest `main` branch.

| Version | Supported |
| :--- | :---: |
| `main` (Latest Production) | :white_check_mark: |
| Older commits / forks | :x: |

---

## Security Architecture Overview

Ellix Connect implements defense-in-depth controls across client, server, and database layers:

1. **Identity & Authentication**
   - Powered by **Supabase Authentication** (Email/Password and Google OAuth 2.0).
   - Protected backend API endpoints (`/api/subscription/*`, `/api/admin/*`) verify Supabase access tokens server-side using the Supabase service-role client (`auth.getUser`).

2. **Multi-Tenant Data Isolation**
   - Operational store data (`/stores/{storeId}/**`) and subscription records (`/clients/{clientId}/**`) are isolated by tenant and governed by Row Level Security policies in [`supabase/migrations/0002_rls.sql`](./supabase/migrations/0002_rls.sql).
   - Unauthenticated visitors on the public website (`/`) do not open cloud database listeners or access tenant tables.

3. **Cryptographic Payment Verification**
   - Subscription checkout verification (`/api/subscription/verify-payment`) and webhook processing (`/api/subscription/webhook`) validate HMAC-SHA256 signatures using constant-time comparison (`crypto.timingSafeEqual`) against raw request payloads.

4. **Security Assessment & Penetration Testing Transparency**
   - Security controls are continuously reviewed through internal architecture audits, dependency checks, and database policy verification. Formal third-party penetration testing is scheduled as part of upcoming enterprise readiness milestones.

---

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for suspected security vulnerabilities.

Instead, report security findings privately to our engineering team:

- **Email**: [support@ellixconnect.com](mailto:support@ellixconnect.com)
- **Subject Line**: `[SECURITY DISCLOSURE] Ellix Connect — <Brief Summary>`

### What to Include
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal proof-of-concept.
- Affected files, endpoints, or database policy definitions.

### Response Timeline
- **Initial Acknowledgment**: Within **48 hours** of receipt.
- **Triage & Status Update**: Within **5 business days**.
- **Remediation**: Prioritized based on severity and coordinated before any public disclosure.
