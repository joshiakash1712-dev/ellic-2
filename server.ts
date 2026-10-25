import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// ==========================================
// SUPABASE ADMIN CLIENT INITIALIZATION
// ==========================================
// The service-role key is server-only. Requests made with it carry a
// `service_role` JWT, so RLS is bypassed and `is_service_role()` is true.
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log('Supabase admin client initialized');
} else {
  console.warn(
    'Supabase admin client not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * The legacy document store's set(..., { merge: true }) read-modify-writes the document. The
 * Supabase tables store the document body in `data`, so merging has to happen
 * in the application, not in the database.
 */
async function mergeDoc(
  table: string,
  idColumn: string,
  id: string,
  patch: Record<string, any>,
  extra: Record<string, any> = {}
): Promise<void> {
  if (!supabaseAdmin) return;
  const { data: existing } = await supabaseAdmin
    .from(table)
    .select('data')
    .eq(idColumn, id)
    .maybeSingle();
  const current = (existing?.data as Record<string, any>) || {};
  const { error } = await supabaseAdmin
    .from(table)
    .upsert({ [idColumn]: id, data: { ...current, ...patch }, ...extra }, { onConflict: idColumn });
  if (error) throw error;
}

async function readDoc(
  table: string,
  idColumn: string,
  id: string
): Promise<Record<string, any> | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('data')
    .eq(idColumn, id)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as Record<string, any>) || null;
}

/**
 * Append to the payment ledger. The table has an FK to `clients(id)`, which
 * the legacy subcollection layout did not require, so a missing parent client is
 * logged instead of failing an otherwise-valid payment.
 */
async function recordPayment(
  clientId: string,
  paymentId: string,
  payload: Record<string, any>
): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from('client_subscription_payments')
    .upsert({ id: paymentId, client_id: clientId, data: payload }, { onConflict: 'id' });
  if (error) {
    console.warn('[Payment ledger] insert skipped:', error.message);
  }
}

// Canonical Role Policy & Fail-Closed Normalization
export type CanonicalRole =
  | 'super_admin'
  | 'ellix_admin'
  | 'client'
  | 'crew'
  | 'wholesaler_admin'
  | 'unauthorized';

export function normalizeCanonicalRole(rawRole: unknown): CanonicalRole {
  if (typeof rawRole !== 'string') return 'unauthorized';
  const normalized = rawRole.trim().toLowerCase();
  switch (normalized) {
    case 'super_admin':
      return 'super_admin';
    case 'ellix_admin':
    case 'admin':
    case 'platform_admin':
      return 'ellix_admin';
    case 'client':
    case 'owner':
    case 'retailer':
      return 'client';
    case 'crew':
    case 'employee':
    case 'cashier':
    case 'staff':
      return 'crew';
    case 'wholesaler_admin':
    case 'wholesaler':
      return 'wholesaler_admin';
    default:
      return 'unauthorized';
  }
}

export function isUserRecordInactive(data: Record<string, any> | undefined | null): boolean {
  if (!data) return false;
  if (data.disabled === true || data.active === false || data.isActive === false) {
    return true;
  }
  if (typeof data.status === 'string') {
    const st = data.status.trim().toLowerCase();
    if (['inactive', 'suspended', 'revoked', 'disabled', 'deactivated', 'deleted'].includes(st)) {
      return true;
    }
  }
  return false;
}

// Authentication & Identity Verification Helper
function isWellFormedJwt(token: string): boolean {
  if (!token || token === 'undefined' || token === 'null') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  return parts.every(part => part.length >= 10 && /^[A-Za-z0-9\-_]+$/.test(part));
}

async function getAuthenticatedCaller(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const accessToken = authHeader.slice(7).trim();
  if (!isWellFormedJwt(accessToken)) {
    return null;
  }

  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return null;
    }
    const authUser = authData.user;

    let rawRole: unknown = authUser.app_metadata?.role ?? authUser.user_metadata?.role;
    let clientId: string | undefined;
    let assignedStoreIds: string[] = [];
    let isInactive = false;

    try {
      const profile = await readDoc('users', 'id', authUser.id);
      if (profile) {
        if (isUserRecordInactive(profile)) {
          isInactive = true;
        }
        if (profile.role !== undefined) {
          rawRole = profile.role;
        }
        clientId = profile.clientId || profile.client_id || clientId;
        if (Array.isArray(profile.assignedStoreIds)) {
          assignedStoreIds = profile.assignedStoreIds;
        }
      }
    } catch {
      // ignore lookup error and use the auth claims
    }

    const emailVerified = Boolean(authUser.email_confirmed_at);
    const isVerifiedRootAdmin =
      authUser.email === 'joshiakash1712@gmail.com' && emailVerified;

    const canonicalRole: CanonicalRole = isVerifiedRootAdmin
      ? 'super_admin'
      : normalizeCanonicalRole(rawRole);

    return {
      uid: authUser.id,
      email: authUser.email,
      emailVerified,
      role: canonicalRole,
      rawRole: typeof rawRole === 'string' ? rawRole : undefined,
      clientId,
      assignedStoreIds,
      isInactive
    };
  } catch {
    // Invalid or expired Supabase access token - reject caller cleanly
    return null;
  }
}

// ==========================================
// HEALTH CHECKS & API ROUTES
// ==========================================

app.get(['/api/health', '/healthz', '/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Machine-readable metadata for AI crawlers, LLM agents, and automated tools
app.get(['/api/about', '/api/metadata', '/.well-known/ai-plugin.json'], (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({
    schema_version: 'v1',
    name_for_human: 'Ellic',
    name_for_model: 'ellic',
    url: 'https://ellic.ai.studio/',
    description_for_human: 'Business management, without the complexity. Ellic brings billing, inventory, customers, payments, transactions, and business insights into one connected platform for local retailers and small businesses.',
    description_for_model: 'Ellic is a web-based business management platform for local retailers, supermarkets, and wholesalers in India (excluding restaurants). It unifies billing and GST invoice generation, inventory and stock management, customer ledger (Khata) tracking, multi-tender payment recording, transaction history, and business insights.',
    auth: {
      type: 'none'
    },
    api: {
      type: 'openapi',
      url: 'https://ellic.ai.studio/api/about',
      is_user_authenticated: false
    },
    platform: ['Web'],
    industry: 'Retail stores, supermarkets, and wholesalers in India (excluding restaurants)',
    features: [
      {
        id: 'billing',
        name: 'Billing and GST invoice generation',
        description: 'Counter billing with itemized CGST/SGST/IGST tax breakdowns based on merchant-configured product rates and printable/downloadable invoice templates.'
      },
      {
        id: 'inventory',
        name: 'Inventory and stock management',
        description: 'Product catalog management with SKUs, barcodes, real-time stock updates on sales, and low-stock threshold alerts.'
      },
      {
        id: 'khata',
        name: 'Customer ledger (Khata) and relationship management',
        description: 'Customer profiles, purchase histories, outstanding credit balance tracking, and WhatsApp payment reminder links.'
      },
      {
        id: 'payments',
        name: 'Payments and multi-tender recording',
        description: 'Support for Cash, Card, Credit (Khata), and direct merchant UPI QR codes using the store’s configured UPI VPA.'
      },
      {
        id: 'transactions',
        name: 'Transaction history and day-end tracking',
        description: 'Searchable invoice and transaction records with payment status filtering and day-end sales summaries.'
      },
      {
        id: 'insights',
        name: 'Business insights and sales analytics',
        description: 'Sales performance summaries, inventory valuation views, and CSV/PDF data exports.'
      }
    ],
    specifications: {
      offline_capability: 'Browser local storage cache for offline billing continuity with Supabase synchronization',
      tax_invoicing_scope: 'Generates GST-formatted invoices and tax summary sheets from merchant inputs; merchants remain responsible for statutory filings',
      llm_documentation_url: 'https://ellic.ai.studio/llms.txt',
      full_reference_url: 'https://ellic.ai.studio/llms-full.txt',
      sitemap_url: 'https://ellic.ai.studio/sitemap.xml'
    }
  });
});

// ==========================================
// CUSTOMER SUPPORT CHATBOT API ENDPOINT
// ==========================================

function getFallbackSupportResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes('printer') || q.includes('thermal') || q.includes('print')) {
    return `### 🖨️ Thermal Printer Setup & Troubleshooting
Ellic supports standard ESC/POS thermal receipt printers (both **58mm** and **80mm** width) across USB and Bluetooth connections.

**Steps to Configure:**
1. **Physical Connection:** Connect your thermal printer via USB to your POS terminal or pair it over Bluetooth in Android/system settings.
2. **Printer Driver / Raw Mode:** Ensure your printer is set to standard ESC/POS command emulation with 203 DPI density.
3. **Print Test:** In Ellic, go to **Billing POS**, complete any test bill, and click **Print Receipt** (or press \`Ctrl + P\` / \`Cmd + P\`).
4. **Paper Feed / Jams:** Ensure thermal paper roll is placed with the coated side facing the print head.

*Need immediate help? Reach our hardware support line on WhatsApp at **+91 98765 43210**.*`;
  }

  if (q.includes('scanner') || q.includes('barcode') || q.includes('scan')) {
    return `### 🔍 Barcode Scanner Setup & Management
Ellic works out-of-the-box with any USB or Wireless 1D/2D Barcode Scanner in **HID Keyboard Emulation Mode**.

**Tips for Fast Scanning:**
1. **Sub-second Recognition:** Ensure your scanner is programmed to append a **Carriage Return (Enter)** suffix after each scan (standard factory default barcode in your scanner's manual).
2. **Adding Barcodes:** Navigate to **Inventory & Stock** > Click **Add Product** > Scan or type the EAN-13/UPC barcode in the SKU/Barcode field.
3. **Barcode Label Generator:** Use our built-in barcode tool in **Inventory** to generate and download printable barcode labels for non-barcoded items.
4. **Camera Scanning:** On mobile/tablet devices, tap the **Camera Scan** button in the POS search bar to use the device's camera.`;
  }

  if (q.includes('khata') || q.includes('credit') || q.includes('due') || q.includes('customer')) {
    return `### 💳 Digital Customer Khata & Credit Ledger
Ellic provides a built-in zero-paper credit book with automated payment recovery.

**How to Use Khata:**
1. **Billing to Khata:** At the POS checkout screen, select **Credit (Khata)** as the tender payment method and choose or add the customer's phone number.
2. **Credit Limits:** Set safety credit limits per customer in **B2B & Clients** to prevent overdue exposure.
3. **WhatsApp Balance Reminders:** Open **B2B & Clients**, select the customer with outstanding balance, and click **Send WhatsApp Reminder**. Ellic generates an instant message containing their invoice breakdown and your direct UPI payment QR link!
4. **Receiving Due Payments:** Click **Receive Payment** on the customer profile to record partial or full settlements.`;
  }

  if (q.includes('gst') || q.includes('tax') || q.includes('report') || q.includes('gstr')) {
    return `### 📊 Statutory GST Reports & Tax Accounting
Ellic automates tax accounting according to Indian GST standards (CGST, SGST, IGST, and HSN/SAC codes).

**Exporting Tax Reports:**
1. Open **Reports & GST** from the sidebar.
2. Select your desired date range (Today, This Week, Month, or Custom Quarter).
3. **GSTR-1 Sales Schedule:** Click **Export GSTR-1** to download an Excel/CSV spreadsheet formatted for direct GST portal filing.
4. **GSTR-3B Summary:** View aggregated taxable turnover, CGST, SGST, and IGST liability.
5. **HSN Summary:** View itemized breakdown by HSN classification with applicable tax slabs (0%, 5%, 12%, 18%, 28%).`;
  }

  if (q.includes('inventory') || q.includes('stock') || q.includes('batch') || q.includes('expiry') || q.includes('dead')) {
    return `### 📦 Real-Time Inventory & Batch Tracking
Ellic keeps inventory synchronized across all registers and warehouses.

**Key Features:**
- **Add Products:** Go to **Inventory & Stock** > click **Add Product**. Set cost price, selling price, GST slab, and minimum stock alert threshold.
- **Low Stock Warnings:** Items dropping below their minimum threshold are highlighted in amber and trigger auto-restock suggestions.
- **Wholesaler Reorder:** Click **Request Restock** directly from any inventory row to dispatch an electronic purchase request to your registered distributor.
- **Dead Stock Detection:** View products with zero sales in the last 30+ days under **Reports & Analytics** > **Dead Stock Analytics**.`;
  }

  if (q.includes('offline') || q.includes('sync') || q.includes('internet') || q.includes('cloud')) {
    return `### ⚡ Offline-First Architecture & Cloud Sync
Ellic is engineered to operate seamlessly even when internet connectivity drops completely.

**How Offline Mode Works:**
1. **Uninterrupted Billing:** You can continue scanning barcodes, generating bills, adding customers, and printing receipts without internet.
2. **Local Data Persistence:** All transactions are instantly saved to secure local client storage.
3. **Auto-Sync:** As soon as internet is restored, Ellic background workers automatically synchronize pending transactions with Supabase.
4. **Manual Sync Check:** You can tap the **Cloud Sync Status** icon in the top navigation bar at any time to verify sync health.`;
  }

  if (q.includes('staff') || q.includes('role') || q.includes('pin') || q.includes('cashier') || q.includes('shift')) {
    return `### 👥 Staff Roles, Security PINs & Shift Handover
Protect financial margins, discount thresholds, and cash drawers with role-based access control.

**Managing Staff & Shifts:**
1. **Staff Directory:** Go to **Staff & Roles** to invite cashiers, store managers, and inventory leads.
2. **4-Digit Quick PIN:** Each cashier logs in with their unique 4-digit security PIN for rapid terminal switching.
3. **Shift Opening & Closing:** At shift start, enter opening drawer cash. At shift end, tally cash/UPI collections against system totals before generating the end-of-day Z-Report.
4. **Tamper-Evident Audit:** View **Admin** > **Audit Trail** to see logged records of refunds, manual price overrides, and deleted bills.`;
  }

  if (q.includes('contact') || q.includes('human') || q.includes('call') || q.includes('agent') || q.includes('phone') || q.includes('help')) {
    return `### 📞 Reach Ellic Human Support Team
Our dedicated customer success and hardware engineering team is available to assist you 7 days a week.

- **WhatsApp Live Chat:** [+91 98765 43210](https://wa.me/919876543210) *(Fastest response, 9 AM - 9 PM IST)*
- **Toll-Free Phone Helpline:** +91 98765 43210
- **Email Support:** [support@ellic.com](mailto:support@ellic.com)
- **Enterprise Escalations:** [enterprise@ellic.com](mailto:enterprise@ellic.com)

*We typically respond within 5-15 minutes on WhatsApp during business hours.*`;
  }

  return `### 👋 Welcome to Ellic Support!
I am your 24/7 AI assistant for **Ellic**. I can assist you with:

- **Billing & POS:** Barcode scanners, thermal printer setup (58mm/80mm), split payments, WhatsApp digital receipts.
- **Inventory & Stock:** Batch tracking, low stock alerts, barcode label generation, CSV import/export.
- **Digital Khata:** Customer credit ledger, automated WhatsApp balance reminders, instant UPI QR links.
- **Tax & GST:** GSTR-1 sales schedules, GSTR-3B tax returns, HSN summaries, PDF exports.
- **Staff & Security:** Cashier shifts, 4-digit quick PINs, audit logs.

Feel free to ask a specific question above or reach our helpline at **+91 98765 43210**.`;
}

app.post('/api/support/chat', (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    return res.status(200).json({
      reply: getFallbackSupportResponse(message),
      source: 'knowledge_base',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Support chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process support request',
      reply: 'Our support service is momentarily reconnecting. Please contact our 24/7 WhatsApp helpline at +91 98765 43210 or email support@ellic.com.'
    });
  }
});

// ==========================================
// 1. SUBSCRIPTION & PAYMENT GATEWAY (RAZORPAY)
// ==========================================

// Create Checkout Session / Order
app.post('/api/subscription/create-checkout', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    if (caller.role === 'crew' || caller.role === 'unauthorized') {
      return res.status(403).json({ error: 'Forbidden: Crew members or unauthorized roles cannot initiate subscription checkout' });
    }

    const { clientId: reqClientId, storeId, planId = 'growth', billingCycle = 'monthly' } = req.body || {};

    let targetClientId: string | undefined;
    if (caller.role === 'super_admin' || caller.role === 'ellix_admin') {
      targetClientId = reqClientId || caller.clientId;
    } else if (caller.role === 'client') {
      if (reqClientId && caller.clientId && reqClientId !== caller.clientId) {
        return res.status(403).json({
          error: 'Forbidden: Cross-tenant subscription checkout rejected',
          code: 'TENANT_ISOLATION_VIOLATION'
        });
      }
      targetClientId = caller.clientId;
    } else {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions for subscription checkout' });
    }

    if (!targetClientId) {
      return res.status(400).json({ error: 'Missing authorized clientId for subscription checkout' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const amountPaise = 149900; // ₹1,499.00 in paise
    const currency = 'INR';

    if (keyId && keySecret) {
      // Live Gateway Integration: Invoke Razorpay Order API
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const orderPayload = {
        amount: amountPaise,
        currency,
        receipt: `rcpt_${targetClientId}_${Date.now()}`,
        notes: {
          clientId: targetClientId,
          storeId: storeId || '',
          planId,
          billingCycle
        }
      };

      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!rzpRes.ok) {
        const errData = await rzpRes.json().catch(() => ({}));
        return res.status(rzpRes.status).json({
          error: 'Failed to create payment order with Razorpay',
          details: errData
        });
      }

      const orderData = await rzpRes.json();
      return res.status(200).json({
        status: 'ok',
        liveGatewayActive: true,
        gateway: 'razorpay',
        keyId,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        clientId: targetClientId
      });
    } else {
      // Gateway not configured in environment
      return res.status(200).json({
        status: 'not_configured',
        liveGatewayActive: false,
        gateway: 'razorpay',
        message: 'LIVE PAYMENT GATEWAY: NOT ACTIVE — CREDENTIALS NOT CONFIGURED',
        details: 'Server environment lacks RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Untrusted client renewal is strictly disabled.',
        plan: {
          id: planId,
          amount: 1499,
          currency: 'INR'
        },
        clientId: targetClientId
      });
    }
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return res.status(500).json({ error: 'Internal server error while creating checkout order' });
  }
});

// Razorpay Webhook Endpoint with Raw-Body HMAC-SHA256 Signature Verification
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!secret) {
      console.warn('Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured on server.');
      return res.status(500).json({
        error: 'RAZORPAY_WEBHOOK_SECRET not configured on server',
        status: 'not_configured'
      });
    }

    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    const rawBodyBuffer: Buffer | undefined = (req as any).rawBody;
    if (!rawBodyBuffer || !Buffer.isBuffer(rawBodyBuffer)) {
      return res.status(400).json({ error: 'Missing raw request body for cryptographic signature verification' });
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    const isSignatureValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!isSignatureValid) {
      console.warn('Cryptographic webhook signature mismatch: unauthorized webhook attempt rejected.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;
    const orderEntity = req.body?.payload?.order?.entity;

    if (event === 'order.paid' || event === 'payment.captured') {
      const clientId = paymentEntity?.notes?.clientId || orderEntity?.notes?.clientId;
      const paymentId = paymentEntity?.id || `pay_${Date.now()}`;
      const orderId = orderEntity?.id || paymentEntity?.order_id || '';
      const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 1499;

      if (clientId && supabaseAdmin) {
        const renewalDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

        // Authoritative server-side update
        await mergeDoc('client_subscriptions', 'client_id', clientId, {
          status: 'active',
          renewalDate,
          gracePeriodEndsAt: null,
          lastPaymentId: paymentId,
          lastPaymentAmount: amount,
          updatedAt: nowIso()
        });

        // Authoritative payment history ledger
        await recordPayment(clientId, paymentId, {
          paymentId,
          gateway: 'razorpay',
          gatewayOrderId: orderId,
          gatewayPaymentId: paymentId,
          clientId,
          amount,
          currency: 'INR',
          status: 'paid',
          paidAt: nowIso(),
          createdAt: nowIso()
        });

        console.log(`[Authoritative Payment] Client ${clientId} subscription renewed via Razorpay webhook`);
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ error: 'Failed to process payment webhook' });
  }
});

// Verify Payment after Frontend Checkout
app.post('/api/subscription/verify-payment', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    if (caller.role === 'crew' || caller.role === 'unauthorized') {
      return res.status(403).json({ error: 'Forbidden: Crew members or unauthorized roles cannot verify subscription payments' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId: reqClientId } = req.body || {};

    let targetClientId: string | undefined;
    if (caller.role === 'super_admin' || caller.role === 'ellix_admin') {
      targetClientId = reqClientId || caller.clientId;
    } else if (caller.role === 'client') {
      if (reqClientId && caller.clientId && reqClientId !== caller.clientId) {
        return res.status(403).json({
          error: 'Forbidden: Cross-tenant payment verification rejected',
          code: 'TENANT_ISOLATION_VIOLATION'
        });
      }
      targetClientId = caller.clientId;
    } else {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions for payment verification' });
    }

    if (!targetClientId) {
      return res.status(400).json({ error: 'Cannot determine authorized client for payment verification' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(400).json({
        error: 'LIVE PAYMENT GATEWAY: NOT ACTIVE — CREDENTIALS NOT CONFIGURED',
        message: 'Cannot verify payment because RAZORPAY_KEY_SECRET is not configured on the server.'
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment signature verification parameters' });
    }

    const generatedSignature = crypto.createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf = Buffer.from(String(razorpay_signature), 'utf8');
    const genBuf = Buffer.from(generatedSignature, 'utf8');
    const isSignatureValid = sigBuf.length === genBuf.length && crypto.timingSafeEqual(sigBuf, genBuf);

    if (!isSignatureValid) {
      return res.status(400).json({ error: 'Payment signature verification failed. Untrusted payment.' });
    }

    const renewalDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    if (supabaseAdmin) {
      await mergeDoc('client_subscriptions', 'client_id', targetClientId, {
        status: 'active',
        renewalDate,
        gracePeriodEndsAt: null,
        lastPaymentId: razorpay_payment_id,
        updatedAt: nowIso()
      });

      await recordPayment(targetClientId, razorpay_payment_id, {
        paymentId: razorpay_payment_id,
        gateway: 'razorpay',
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        clientId: targetClientId,
        amount: 1499,
        currency: 'INR',
        status: 'paid',
        paidAt: nowIso(),
        createdAt: nowIso()
      });
    }

    return res.status(200).json({
      status: 'ok',
      verified: true,
      message: 'Payment cryptographically verified. Subscription activated.',
      renewalDate
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ error: 'Internal server error while verifying payment' });
  }
});

// ==========================================
// 2. SECURE CLOUD TENANT DELETION & PURGE
// ==========================================

async function handleTenantPurge(req: express.Request, res: express.Response) {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    const { clientId: reqClientId } = req.body || {};

    let targetClientId: string | undefined;

    if (caller.role === 'super_admin' || caller.role === 'ellix_admin') {
      targetClientId = reqClientId || caller.clientId;
    } else if (caller.role === 'client') {
      // Strict Tenant Boundary Check:
      // A Client can ONLY purge their own trusted caller.clientId and can never supply another clientId!
      if (reqClientId && caller.clientId && caller.clientId !== reqClientId) {
        return res.status(403).json({
          error: 'Forbidden: Cross-tenant deletion attempt rejected!',
          code: 'TENANT_ISOLATION_VIOLATION'
        });
      }
      targetClientId = caller.clientId;
      if (!targetClientId) {
        return res.status(403).json({
          error: 'Forbidden: Authenticated client has no trusted tenant binding',
          code: 'MISSING_TRUSTED_TENANT_ID'
        });
      }
    } else {
      // Crew, employees, cashiers, wholesalers, or unauthorized roles cannot purge tenants
      return res.status(403).json({
        error: 'Forbidden: Insufficient role authority to purge tenant data'
      });
    }

    if (!targetClientId) {
      return res.status(400).json({ error: 'Missing clientId for tenant purge' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database service is currently offline on server' });
    }

    // 1. Locate all stores belonging to targetClientId
    const { data: storeRows, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('data->>clientId', targetClientId);
    if (storeError) throw storeError;

    // Store-scoped tables that hold tenant data.
    const storeScopedTables = [
      'products',
      'invoices',
      'customers',
      'employees',
      'suppliers',
      'restock_logs',
      'restock_orders',
      'customer_orders',
      'notifications',
      'audit_logs',
      'wholesalers',
      'store_counters'
    ];

    let purgedStoresCount = 0;

    for (const storeRow of storeRows || []) {
      const storeId = storeRow.id;
      for (const table of storeScopedTables) {
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('store_id', storeId);
        if (deleteError) throw deleteError;
      }
      const { error: storeDeleteError } = await supabaseAdmin
        .from('stores')
        .delete()
        .eq('id', storeId);
      if (storeDeleteError) throw storeDeleteError;
      purgedStoresCount++;
    }

    // 2. Mark subscription as cancelled
    await mergeDoc('client_subscriptions', 'client_id', targetClientId, {
      status: 'cancelled',
      cancelledAt: nowIso(),
      cancellationReason: 'Tenant permanently purged by authorized user'
    });

    return res.status(200).json({
      status: 'ok',
      message: `Tenant ${targetClientId} securely purged. ${purgedStoresCount} stores and all subcollections deleted.`,
      purgedStoresCount
    });
  } catch (error: any) {
    console.error('Tenant purge error:', error);
    return res.status(500).json({ error: 'Failed to securely purge tenant data', details: error?.message });
  }
}

app.post('/api/admin/tenant/purge', handleTenantPurge);
app.post('/api/subscription/cancel-and-purge', handleTenantPurge);

// ==========================================
// 3. ADMIN SUBSCRIPTION STATUS OVERRIDE
// ==========================================

app.post('/api/admin/subscription/status', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    const isPlatformAdmin = caller.role === 'super_admin' || caller.role === 'ellix_admin';
    if (!isPlatformAdmin) {
      return res.status(403).json({ error: 'Forbidden: Ellic Admin or Super Admin authority required to modify client subscriptions' });
    }

    const { clientId, status, renewalDate, gracePeriodEndsAt } = req.body || {};
    if (!clientId || !status) {
      return res.status(400).json({ error: 'clientId and status are required' });
    }

    const validStatuses = ['active', 'trial', 'grace_period', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid subscription status value' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database service unavailable' });
    }

    const updatePayload: Record<string, any> = {
      status,
      updatedAt: nowIso(),
      updatedBy: caller.email || caller.uid
    };
    if (renewalDate !== undefined) updatePayload.renewalDate = renewalDate;
    if (gracePeriodEndsAt !== undefined) updatePayload.gracePeriodEndsAt = gracePeriodEndsAt;

    // The subscription row has an FK to clients(id); upsert the parent first so
    // this also works for a client that has no document yet (the legacy database created
    // both implicitly via merge writes).
    await mergeDoc('clients', 'id', clientId, {
      subscriptionStatus: status,
      updatedAt: nowIso()
    });
    await mergeDoc('client_subscriptions', 'client_id', clientId, updatePayload);

    return res.status(200).json({
      status: 'ok',
      message: `Subscription status for client ${clientId} updated to ${status}`,
      clientId,
      subscriptionStatus: status
    });
  } catch (err: any) {
    console.error('Admin subscription status update error:', err);
    return res.status(500).json({ error: 'Failed to update subscription status', details: err?.message });
  }
});

// ==========================================
// 4. SUPER ADMIN ELLIC ADMIN MANAGEMENT
// ==========================================

// List Ellic Admins (Super Admin Only)
app.get('/api/admin/team', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    const isSuper = caller.role === 'super_admin' || (caller.email === 'joshiakash1712@gmail.com' && caller.emailVerified);

    if (!isSuper) {
      return res.status(403).json({ error: 'Forbidden: Super Admin authority required' });
    }

    if (!supabaseAdmin) {
      return res.status(200).json({ team: [] });
    }

    const { data: userRows, error: teamError } = await supabaseAdmin
      .from('users')
      .select('id,data')
      .in('data->>role', ['ellix_admin', 'super_admin', 'admin', 'platform_admin']);
    if (teamError) throw teamError;

    const team = (userRows || []).map(row => {
      const data = (row.data as Record<string, any>) || {};
      return {
        uid: row.id,
        name: data.displayName || data.name || 'Admin Member',
        email: data.email || '',
        role: normalizeCanonicalRole(data.role) === 'super_admin' ? 'super_admin' : 'ellix_admin',
        status: data.status || 'active',
        department: data.department || 'Operations',
        createdAt: data.createdAt || nowIso()
      };
    });

    return res.status(200).json({ team });
  } catch (err: any) {
    console.error('Get admin team error:', err);
    return res.status(500).json({ error: 'Failed to retrieve admin team' });
  }
});

// Create/Invite Ellic Admin (Super Admin Only)
app.post('/api/admin/team/create', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    const isSuper = caller.role === 'super_admin' || (caller.email === 'joshiakash1712@gmail.com' && caller.emailVerified);

    if (!isSuper) {
      return res.status(403).json({ error: 'Forbidden: Super Admin authority required to invite Ellic Admins' });
    }

    const { name, email, department } = req.body || {};
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database service unavailable' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find an existing auth user by email, otherwise invite one. Supabase's
    // admin API creates the auth.users row; the auth trigger creates the
    // public.users row, and the upsert below sets the authoritative role.
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    if (listError) throw listError;

    let uid = '';
    const users = userList?.users ?? [];
    for (const u of users) {
      if ((u.email || '').toLowerCase() === normalizedEmail) {
        uid = u.id;
        break;
      }
    }

    if (!uid) {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: false,
        user_metadata: { displayName: name, role: 'ellix_admin' }
      });
      if (createError) throw createError;
      uid = created.user?.id || '';
    }

    if (!uid) {
      return res.status(500).json({ error: 'Failed to provision an auth identity for the admin' });
    }

    // Assign strictly ellix_admin role
    await mergeDoc('users', 'id', uid, {
      uid,
      displayName: name,
      name,
      email: normalizedEmail,
      role: 'ellix_admin',
      status: 'active',
      department: department || 'Operations',
      createdAt: nowIso(),
      invitedBy: caller.email || 'joshiakash1712@gmail.com'
    });

    return res.status(200).json({
      status: 'ok',
      message: `Ellic Admin ${name} (${email}) provisioned successfully`,
      admin: { uid, name, email, role: 'ellix_admin', status: 'active', department: department || 'Operations' }
    });
  } catch (err: any) {
    console.error('Create admin error:', err);
    return res.status(500).json({ error: 'Failed to create Ellic Admin', details: err?.message });
  }
});

// Revoke Ellic Admin Access (Super Admin Only)
app.post('/api/admin/team/revoke', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: Valid Supabase authentication token required' });
    }
    if (caller.isInactive) {
      return res.status(403).json({ error: 'Forbidden: User account is deactivated, suspended, or revoked' });
    }

    const isSuper = caller.role === 'super_admin' || (caller.email === 'joshiakash1712@gmail.com' && caller.emailVerified);

    if (!isSuper) {
      return res.status(403).json({ error: 'Forbidden: Super Admin authority required to revoke admins' });
    }

    const { uid } = req.body || {};
    if (!uid) {
      return res.status(400).json({ error: 'User UID is required to revoke admin' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database service unavailable' });
    }

    const existingUser = await readDoc('users', 'id', uid);
    if (existingUser) {
      if (existingUser.email === 'joshiakash1712@gmail.com' || existingUser.role === 'super_admin') {
        return res.status(400).json({ error: 'Cannot revoke Super Admin root account!' });
      }
    }

    await mergeDoc('users', 'id', uid, {
      role: 'client',
      status: 'revoked',
      revokedAt: nowIso(),
      revokedBy: caller.email || 'joshiakash1712@gmail.com'
    });

    return res.status(200).json({
      status: 'ok',
      message: `Admin access revoked for user ${uid}`
    });
  } catch (err: any) {
    console.error('Revoke admin error:', err);
    return res.status(500).json({ error: 'Failed to revoke admin access', details: err?.message });
  }
});

// Serve static brand assets from public directory explicitly
app.use(express.static(path.resolve(process.cwd(), 'public'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// ==========================================
// STATIC ASSETS OR VITE DEV MIDDLEWARE
// ==========================================

// Named handlers so the Cloud Functions branch can mount the same API surface.
const apiNotFoundHandler = (req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
};

// Global Express Error Handler
const errorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
};

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const indexPath = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(indexPath);
  const lifecycle = process.env.npm_lifecycle_event;
  const isExplicitDev = process.env.NODE_ENV === 'development' || lifecycle === 'dev';
  const isProduction =
    !isExplicitDev &&
    (process.env.NODE_ENV === 'production' ||
      Boolean(process.env.K_SERVICE) ||
      lifecycle === 'start');

  // Fallback 404 handler for unmatched API routes (must be mounted before SPA catch-all)
  app.use('/api', apiNotFoundHandler);

  if (!isProduction || !hasDist) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve immutable content-hashed Vite bundles with long-term caching for fast loads
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        immutable: true,
        maxAge: '1y',
        setHeaders: (res) => {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      })
    );

    // Serve other pre-compiled static files with balanced caching, keeping index.html uncached
    app.use(
      express.static(distPath, {
        index: false,
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }
        }
      })
    );

    // SPA fallback: Serve index.html for all non-static page requests
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    });
  }

  app.use(errorHandler);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ellic Enterprise Server running on http://0.0.0.0:${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });

  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}, gracefully shutting down HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export { app };

// Cloud Functions (and its local emulator) provide their own HTTP server, so the
// app must only expose the API surface and must never bind a port itself.
const isCloudFunctionsRuntime = Boolean(process.env.K_SERVICE || process.env.FUNCTIONS_EMULATOR);

if (isCloudFunctionsRuntime) {
  app.use('/api', apiNotFoundHandler);
  app.use(errorHandler);
} else if (process.env.VITEST !== 'true') {
  startServer().catch((err) => {
    console.error('Fatal server initialization error:', err);
    process.exit(1);
  });
}
