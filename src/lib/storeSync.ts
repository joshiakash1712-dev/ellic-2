import { supabase, SUPABASE_PROJECT_REF } from './supabase';
import {
  Product,
  CustomerProfile,
  POSInvoice,
  RestockOrder,
  CustomerOrder,
  AuditLog,
  Wholesaler,
  Employee,
  Store,
  Supplier,
  RestockLog,
  OfflineSyncItem,
  CloudSyncState,
  SaveFeedback,
  normalizeCanonicalRole
} from '../types';
import {
  mockProducts,
  mockCustomers,
  mockInvoices,
  mockRestockOrders,
  mockCustomerOrders,
  mockEmployees,
  mockAuditLogs,
  mockWholesalers,
  mockWholesalerProducts,
  mockSuppliers,
  mockRestockLogs,
  mockConnections,
  mockNotifications,
  mockBusinessApplications
} from '../data/mockData';

// --------------------------------------------------------------------------
// Store data layer backed by Supabase (Postgres + RLS).
//
// StoreSyncManager coordinates offline
// queueing and Supabase synchronization. Supabase Auth is now the identity
// provider; `src/lib/supabase.ts` manages the Supabase session directly.
// --------------------------------------------------------------------------

const OFFLINE_QUEUE_KEY = 'ellix_offline_sync_queue';
const INVOICE_COUNTER_STORAGE_PREFIX = 'ellix_invoice_counter_';

export const MOCK_FIXTURE_IDS = new Set<string>([
  ...mockProducts.map(item => item.id),
  ...mockCustomers.map(item => item.id),
  ...mockInvoices.map(item => item.id),
  ...mockRestockOrders.map(item => item.id),
  ...mockCustomerOrders.map(item => item.id),
  ...mockEmployees.map(item => item.id),
  ...mockAuditLogs.map(item => item.id),
  ...mockWholesalers.map(item => item.id),
  ...mockWholesalerProducts.map(item => item.id),
  ...mockSuppliers.map(item => item.id),
  ...mockRestockLogs.map(item => item.id),
  ...mockConnections.map(item => item.id),
  ...mockNotifications.map(item => item.id),
  ...mockBusinessApplications.map(item => item.id)
]);

export function isMockFixtureId(id: unknown): boolean {
  return typeof id === 'string' && MOCK_FIXTURE_IDS.has(id);
}

export function stripMockFixtures<T>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item: any) => !isMockFixtureId(item?.id));
}

export interface StoreInvoiceCounterState {
  storeId: string;
  lastSequence: number;
  baselineSequence: number;
  issuedNumbers: Record<string, string>; // invoiceNumber -> invoiceId
  issuedByInvoiceId: Record<
    string,
    { invoiceNumber: string; sequence: number; updatedAt: string }
  >;
  updatedAt: string;
}

const inMemoryStoreCounters = new Map<string, StoreInvoiceCounterState>();

export function getInvoiceDateKey(dateStr?: string): string {
  if (typeof dateStr === 'string') {
    const digits = dateStr.slice(0, 10).replace(/-/g, '');
    if (/^\d{8}$/.test(digits)) {
      return digits;
    }
  }
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

export function formatStoreInvoiceNumber(dateKey: string, sequence: number): string {
  const safeSeq = Math.max(1, Math.floor(Number(sequence) || 1));
  const cleanDate = /^\d{8}$/.test(dateKey)
    ? dateKey
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `INV-${cleanDate}-${safeSeq.toString().padStart(2, '0')}`;
}

export function parseInvoiceSequenceNumber(invoiceNumber?: string | null): number {
  if (!invoiceNumber || typeof invoiceNumber !== 'string') return 0;
  const match = invoiceNumber.trim().match(/^INV-(?:\d{8}|\d{4}-\d{4})-(\d+)$/i);
  if (!match) return 0;
  const parsed = parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function pruneCounterMaps(state: StoreInvoiceCounterState, maxEntries = 500): void {
  const idEntries = Object.entries(state.issuedByInvoiceId);
  if (idEntries.length <= maxEntries) return;
  idEntries.sort((a, b) => a[1].sequence - b[1].sequence);
  const toRemove = idEntries.slice(0, idEntries.length - maxEntries);
  for (const [invId, info] of toRemove) {
    delete state.issuedByInvoiceId[invId];
    if (state.issuedNumbers[info.invoiceNumber] === invId) {
      delete state.issuedNumbers[info.invoiceNumber];
    }
  }
}

export function getStoreInvoiceCounterState(storeId: string): StoreInvoiceCounterState {
  const cleanStoreId = storeId || 'store-1';
  const existingMem = inMemoryStoreCounters.get(cleanStoreId);
  let storedState: Partial<StoreInvoiceCounterState> | null = null;
  try {
    const raw = localStorage.getItem(`${INVOICE_COUNTER_STORAGE_PREFIX}${cleanStoreId}`);
    if (raw) {
      storedState = JSON.parse(raw);
    }
  } catch {
    // ignore storage read errors
  }

  const nowIso = new Date().toISOString();
  const mergedIssuedNumbers: Record<string, string> = {
    ...(storedState?.issuedNumbers || {}),
    ...(existingMem?.issuedNumbers || {})
  };
  const mergedIssuedByInvoiceId: Record<
    string,
    { invoiceNumber: string; sequence: number; updatedAt: string }
  > = {
    ...(storedState?.issuedByInvoiceId || {}),
    ...(existingMem?.issuedByInvoiceId || {})
  };

  let maxSeq = Math.max(
    0,
    Number(storedState?.lastSequence || 0),
    Number(existingMem?.lastSequence || 0),
    Number(storedState?.baselineSequence || 0),
    Number(existingMem?.baselineSequence || 0)
  );
  for (const info of Object.values(mergedIssuedByInvoiceId)) {
    if (Number.isFinite(info.sequence) && info.sequence > maxSeq) {
      maxSeq = info.sequence;
    }
  }

  const state: StoreInvoiceCounterState = {
    storeId: cleanStoreId,
    lastSequence: maxSeq,
    baselineSequence: Math.max(
      0,
      Number(storedState?.baselineSequence || 0),
      Number(existingMem?.baselineSequence || 0)
    ),
    issuedNumbers: mergedIssuedNumbers,
    issuedByInvoiceId: mergedIssuedByInvoiceId,
    updatedAt: nowIso
  };
  inMemoryStoreCounters.set(cleanStoreId, state);
  return state;
}

export function saveStoreInvoiceCounterState(
  storeId: string,
  state: StoreInvoiceCounterState
): void {
  const cleanStoreId = storeId || 'store-1';
  pruneCounterMaps(state);
  inMemoryStoreCounters.set(cleanStoreId, state);
  try {
    localStorage.setItem(
      `${INVOICE_COUNTER_STORAGE_PREFIX}${cleanStoreId}`,
      JSON.stringify(state)
    );
  } catch {
    // ignore storage quota errors
  }
}

export function reconcileStoreInvoiceCounter(
  storeId: string,
  existingInvoices?: Array<{ id?: string; invoiceNumber?: string; storeId?: string }>,
  remoteCounter?: Partial<StoreInvoiceCounterState>
): StoreInvoiceCounterState {
  const cleanStoreId = storeId || 'store-1';
  const state = getStoreInvoiceCounterState(cleanStoreId);
  const nowIso = new Date().toISOString();

  if (remoteCounter) {
    if (
      typeof remoteCounter.lastSequence === 'number' &&
      remoteCounter.lastSequence > state.lastSequence
    ) {
      state.lastSequence = remoteCounter.lastSequence;
    }
    if (
      typeof remoteCounter.baselineSequence === 'number' &&
      remoteCounter.baselineSequence > state.baselineSequence
    ) {
      state.baselineSequence = remoteCounter.baselineSequence;
    }
    if (remoteCounter.issuedNumbers && typeof remoteCounter.issuedNumbers === 'object') {
      state.issuedNumbers = {
        ...state.issuedNumbers,
        ...remoteCounter.issuedNumbers
      };
    }
    if (remoteCounter.issuedByInvoiceId && typeof remoteCounter.issuedByInvoiceId === 'object') {
      state.issuedByInvoiceId = {
        ...state.issuedByInvoiceId,
        ...remoteCounter.issuedByInvoiceId
      };
      for (const info of Object.values(remoteCounter.issuedByInvoiceId)) {
        if (info && Number.isFinite(info.sequence)) {
          if (info.sequence > state.lastSequence) state.lastSequence = info.sequence;
          if (info.sequence > state.baselineSequence) state.baselineSequence = info.sequence;
        }
      }
    }
  }

  const allSources: Array<{
    id?: string;
    invoiceNumber?: string;
    storeId?: string;
    isOfflineQueued?: boolean;
  }> = [];
  if (Array.isArray(existingInvoices)) {
    allSources.push(...existingInvoices);
  }

  // Also include any store-scoped cached invoices in localStorage
  try {
    const rawCached = localStorage.getItem(`ellix_invoices_${cleanStoreId}`);
    if (rawCached) {
      const parsed = JSON.parse(rawCached);
      if (Array.isArray(parsed)) {
        allSources.push(...parsed);
      }
    }
  } catch {
    // ignore
  }

  // Also include any pending offline queue invoices for this store
  const queue = getOfflineQueue();
  for (const item of queue) {
    if (
      item.collection === 'invoices' &&
      item.action !== 'delete' &&
      item.data &&
      (!item.data.storeId || item.data.storeId === cleanStoreId)
    ) {
      allSources.push({
        id: item.docId || item.data.id,
        invoiceNumber: item.data.invoiceNumber,
        storeId: item.data.storeId || cleanStoreId,
        isOfflineQueued: true
      });
    }
  }

  let scopedCount = 0;
  let committedCount = 0;
  const seenIds = new Set<string>();
  for (const inv of allSources) {
    if (!inv || (inv.storeId && inv.storeId !== cleanStoreId)) continue;
    if (inv.id && !seenIds.has(inv.id)) {
      seenIds.add(inv.id);
      scopedCount += 1;
      if (!inv.isOfflineQueued) {
        committedCount += 1;
      }
    }
    const seq = parseInvoiceSequenceNumber(inv.invoiceNumber);
    if (seq > state.lastSequence) {
      state.lastSequence = seq;
    }
    if (!inv.isOfflineQueued && seq > state.baselineSequence) {
      state.baselineSequence = seq;
    }
    if (inv.invoiceNumber && inv.id) {
      if (!state.issuedNumbers[inv.invoiceNumber]) {
        state.issuedNumbers[inv.invoiceNumber] = inv.id;
      }
      if (!state.issuedByInvoiceId[inv.id]) {
        state.issuedByInvoiceId[inv.id] = {
          invoiceNumber: inv.invoiceNumber,
          sequence: seq > 0 ? seq : scopedCount,
          updatedAt: nowIso
        };
      }
    }
  }

  if (scopedCount > state.lastSequence) {
    state.lastSequence = scopedCount;
  }
  if (committedCount > state.baselineSequence) {
    state.baselineSequence = committedCount;
  }

  state.updatedAt = nowIso;
  saveStoreInvoiceCounterState(cleanStoreId, state);
  return state;
}

export function reserveStoreInvoiceNumber(
  storeId: string,
  invoiceId: string,
  dateStr?: string,
  existingInvoices?: Array<{ id?: string; invoiceNumber?: string; storeId?: string }>
): string {
  const cleanStoreId = storeId || 'store-1';
  const state = reconcileStoreInvoiceCounter(cleanStoreId, existingInvoices);
  const nowIso = new Date().toISOString();

  // Idempotent return if this exact invoiceId already has a reserved/issued number
  const existingForId = state.issuedByInvoiceId[invoiceId];
  if (existingForId && existingForId.invoiceNumber) {
    state.issuedNumbers[existingForId.invoiceNumber] = invoiceId;
    saveStoreInvoiceCounterState(cleanStoreId, state);
    return existingForId.invoiceNumber;
  }

  const dateKey = getInvoiceDateKey(dateStr);
  let nextSeq = state.lastSequence + 1;
  let candidate = formatStoreInvoiceNumber(dateKey, nextSeq);

  while (state.issuedNumbers[candidate] && state.issuedNumbers[candidate] !== invoiceId) {
    nextSeq += 1;
    candidate = formatStoreInvoiceNumber(dateKey, nextSeq);
  }

  state.lastSequence = nextSeq;
  state.issuedNumbers[candidate] = invoiceId;
  state.issuedByInvoiceId[invoiceId] = {
    invoiceNumber: candidate,
    sequence: nextSeq,
    updatedAt: nowIso
  };
  state.updatedAt = nowIso;
  saveStoreInvoiceCounterState(cleanStoreId, state);
  return candidate;
}

export function commitStoreInvoiceNumber(
  storeId: string,
  invoiceId: string,
  invoiceNumber: string
): void {
  const cleanStoreId = storeId || 'store-1';
  const state = getStoreInvoiceCounterState(cleanStoreId);
  const nowIso = new Date().toISOString();
  const seq = parseInvoiceSequenceNumber(invoiceNumber);

  // Remove any previous tentative number registered to this invoiceId if reassigned
  const previous = state.issuedByInvoiceId[invoiceId];
  if (previous && previous.invoiceNumber !== invoiceNumber) {
    if (state.issuedNumbers[previous.invoiceNumber] === invoiceId) {
      delete state.issuedNumbers[previous.invoiceNumber];
    }
  }

  const effectiveSeq = seq > 0 ? seq : Math.max(1, state.lastSequence);
  if (effectiveSeq > state.lastSequence) {
    state.lastSequence = effectiveSeq;
  }
  if (effectiveSeq > state.baselineSequence) {
    state.baselineSequence = effectiveSeq;
  }
  state.issuedNumbers[invoiceNumber] = invoiceId;
  state.issuedByInvoiceId[invoiceId] = {
    invoiceNumber,
    sequence: effectiveSeq,
    updatedAt: nowIso
  };
  state.updatedAt = nowIso;
  saveStoreInvoiceCounterState(cleanStoreId, state);
}

export function releaseStoreInvoiceNumberReservation(
  storeId: string,
  invoiceId: string
): void {
  const cleanStoreId = storeId || 'store-1';
  const state = getStoreInvoiceCounterState(cleanStoreId);
  const existing = state.issuedByInvoiceId[invoiceId];
  if (!existing) return;

  delete state.issuedByInvoiceId[invoiceId];
  if (state.issuedNumbers[existing.invoiceNumber] === invoiceId) {
    delete state.issuedNumbers[existing.invoiceNumber];
  }

  let maxRemainingSeq = state.baselineSequence;
  for (const info of Object.values(state.issuedByInvoiceId)) {
    if (Number.isFinite(info.sequence) && info.sequence > maxRemainingSeq) {
      maxRemainingSeq = info.sequence;
    }
  }
  state.lastSequence = maxRemainingSeq;
  state.updatedAt = new Date().toISOString();
  saveStoreInvoiceCounterState(cleanStoreId, state);
}

export class InsufficientStockError extends Error {
  public readonly code = 'INSUFFICIENT_STOCK';
  public readonly productId?: string;
  public readonly availableStock?: number;
  public readonly requestedQuantity?: number;

  constructor(
    message: string,
    details?: { productId?: string; availableStock?: number; requestedQuantity?: number }
  ) {
    super(message);
    this.name = 'InsufficientStockError';
    this.productId = details?.productId;
    this.availableStock = details?.availableStock;
    this.requestedQuantity = details?.requestedQuantity;
  }
}

export function isInsufficientStockError(err: unknown): err is InsufficientStockError {
  return (
    err instanceof InsufficientStockError ||
    (typeof err === 'object' &&
      err !== null &&
      ((err as any).name === 'InsufficientStockError' || (err as any).code === 'INSUFFICIENT_STOCK'))
  );
}

export function getOfflineQueue(): OfflineSyncItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item: any) => !isMockFixtureId(item?.docId));
  } catch (e) {
    console.error('Failed to read offline sync queue:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineSyncItem[]): void {
  try {
    const cleanQueue = Array.isArray(queue)
      ? queue.filter(item => !isMockFixtureId(item?.docId))
      : [];
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(cleanQueue));
  } catch (e) {
    console.error('Failed to save offline sync queue:', e);
  }
}

export function queueOfflineAction(item: Omit<OfflineSyncItem, 'id' | 'timestamp'>): void {
  if (isMockFixtureId(item.docId)) {
    return;
  }
  const queue = getOfflineQueue();
  const targetStoreId = item.data?.storeId || '';

  // Ensure invoice numbers in the offline queue are unique per store and idempotent per invoice docId
  if (item.collection === 'invoices' && item.action !== 'delete' && item.data) {
    const storeIdForInv = item.data.storeId || 'store-1';
    const invId = item.docId || item.data.id;
    const conflictingInQueue = queue.some(
      q =>
        q.collection === 'invoices' &&
        q.action !== 'delete' &&
        q.docId !== invId &&
        (q.data?.storeId || 'store-1') === storeIdForInv &&
        q.data?.invoiceNumber &&
        q.data.invoiceNumber === item.data.invoiceNumber
    );
    if (!item.data.invoiceNumber || conflictingInQueue) {
      if (conflictingInQueue) {
        releaseStoreInvoiceNumberReservation(storeIdForInv, invId);
      }
      const assigned = reserveStoreInvoiceNumber(storeIdForInv, invId, item.data.date);
      item.data = {
        ...item.data,
        invoiceNumber: assigned
      };
    } else {
      const state = getStoreInvoiceCounterState(storeIdForInv);
      const seq = parseInvoiceSequenceNumber(item.data.invoiceNumber);
      if (seq > state.lastSequence) {
        state.lastSequence = seq;
      }
      state.issuedNumbers[item.data.invoiceNumber] = invId;
      state.issuedByInvoiceId[invId] = {
        invoiceNumber: item.data.invoiceNumber,
        sequence: seq > 0 ? seq : Math.max(1, state.lastSequence),
        updatedAt: new Date().toISOString()
      };
      saveStoreInvoiceCounterState(storeIdForInv, state);
    }
  }

  // Deduplicate existing queued action for the same collection + docId + storeId
  const existingIdx = queue.findIndex(
    q =>
      q.collection === item.collection &&
      q.docId === item.docId &&
      (q.data?.storeId || '') === targetStoreId
  );

  if (existingIdx >= 0) {
    if (item.action === 'delete' && queue[existingIdx].action === 'create') {
      queue.splice(existingIdx, 1);
    } else {
      const preservedInvoiceNumber =
        item.collection === 'invoices' && queue[existingIdx].data?.invoiceNumber
          ? queue[existingIdx].data.invoiceNumber
          : item.data?.invoiceNumber;
      queue[existingIdx] = {
        ...queue[existingIdx],
        action: item.action,
        data:
          item.collection === 'invoices' && item.data && preservedInvoiceNumber
            ? { ...item.data, invoiceNumber: preservedInvoiceNumber }
            : item.data,
        timestamp: new Date().toISOString()
      };
    }
    saveOfflineQueue(queue);
    return;
  }

  queue.push({
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString()
  });
  saveOfflineQueue(queue);
}

// Data Sanitization helpers to prevent undefined fields in the cloud database
function sanitizeData<T extends Record<string, any>>(data: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (typeof value === 'number') {
        sanitized[key] = isNaN(value) ? 0 : value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}

export interface StoreSyncListeners {
  onProductsUpdate?: (products: Product[]) => void;
  onCustomersUpdate?: (customers: CustomerProfile[]) => void;
  onInvoicesUpdate?: (invoices: POSInvoice[]) => void;
  onRestockOrdersUpdate?: (orders: RestockOrder[]) => void;
  onCustomerOrdersUpdate?: (orders: CustomerOrder[]) => void;
  onAuditLogsUpdate?: (logs: AuditLog[]) => void;
  onWholesalersUpdate?: (wholesalers: Wholesaler[]) => void;
  onEmployeesUpdate?: (employees: Employee[]) => void;
  onSuppliersUpdate?: (suppliers: Supplier[]) => void;
  onRestockLogsUpdate?: (logs: RestockLog[]) => void;
  onSyncStateChange?: (state: Partial<CloudSyncState>) => void;
  onSaveFeedback?: (feedback: SaveFeedback) => void;
  onInitialDataLoaded?: () => void;
}

type StoreTable =
  | 'products'
  | 'customers'
  | 'invoices'
  | 'restock_orders'
  | 'customer_orders'
  | 'audit_logs'
  | 'wholesalers'
  | 'employees'
  | 'suppliers'
  | 'restock_logs';

const TABLE_BY_COLLECTION: Record<string, StoreTable> = {
  products: 'products',
  customers: 'customers',
  invoices: 'invoices',
  restockOrders: 'restock_orders',
  customerOrders: 'customer_orders',
  auditLogs: 'audit_logs',
  wholesalers: 'wholesalers',
  employees: 'employees',
  suppliers: 'suppliers',
  restockLogs: 'restock_logs'
};

function isOfflineFailure(err: any): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const message = String(err?.message || err || '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('fetch failed') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('network error') ||
    message.includes('timed out') ||
    message.includes('timeout')
  );
}

function parseRpcDetail(error: any): Record<string, any> {
  const raw = error?.details ?? error?.detail;
  if (!raw) return {};
  if (typeof raw === 'object') return raw as Record<string, any>;
  try {
    return JSON.parse(String(raw));
  } catch {
    return {};
  }
}

function sortById<T extends { id?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => String(a?.id || '').localeCompare(String(b?.id || '')));
}

// --------------------------------------------------------------------------
// Real-Time Store Sync Service (Supabase / Postgres)
//
// The file and class names are kept for compatibility with existing imports.
// Each collection is stored as a document row: { id, store_id, data }.
// --------------------------------------------------------------------------

export class StoreSyncManager {
  private activeStoreId: string = 'store_main_1';
  private unsubs: Array<() => void> = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private currentListeners: StoreSyncListeners | null = null;
  private feedbackTimer: any = null;
  private realtimeChannel: any = null;
  private storeId: string = '';
  private rows: Partial<Record<StoreTable, any[]>> = {};
  private rowFilters: Partial<Record<StoreTable, { column: string; value: string }>> = {};

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyFeedback('saved', 'Connection restored. Synchronized with cloud.');
      this.flushQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyFeedback('error', 'Offline mode. Changes queued locally.');
    });
  }

  public getDatabaseId(): string {
    return SUPABASE_PROJECT_REF;
  }

  public notifyFeedback(status: SaveFeedback['status'], message: string): void {
    if (!this.currentListeners?.onSaveFeedback) return;
    this.currentListeners.onSaveFeedback({
      status,
      message,
      timestamp: Date.now()
    });

    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }

    if (status === 'saved') {
      this.feedbackTimer = setTimeout(() => {
        this.currentListeners?.onSaveFeedback?.({
          status: 'idle',
          message: '',
          timestamp: Date.now()
        });
      }, 1200);
    } else if (status === 'error') {
      this.feedbackTimer = setTimeout(() => {
        this.currentListeners?.onSaveFeedback?.({
          status: 'idle',
          message: '',
          timestamp: Date.now()
        });
      }, 3500);
    }
  }

  // Subscribe to all store-scoped tables for the active store
  public subscribeToStore(
    storeId: string,
    callbacks: StoreSyncListeners,
    authOptions?: {
      userUid?: string;
      userRole?: string;
    }
  ): () => void {
    this.unsubscribeAll();
    this.activeStoreId = storeId;
    this.storeId = storeId;
    this.currentListeners = callbacks;

    callbacks.onSyncStateChange?.({
      status: 'syncing',
      databaseId: this.getDatabaseId(),
      pendingCount: getOfflineQueue().length
    });

    const counts: Record<string, number> = {
      products: 0,
      customers: 0,
      invoices: 0,
      restockOrders: 0,
      customerOrders: 0,
      wholesalers: 0,
      employees: 0,
      suppliers: 0,
      restockLogs: 0
    };

    const initialReady = new Set<string>();
    let hasNotifiedInitialLoad = false;
    const checkInitialLoad = (name: string) => {
      initialReady.add(name);
      if (
        !hasNotifiedInitialLoad &&
        initialReady.has('products') &&
        initialReady.has('customers') &&
        initialReady.has('invoices') &&
        initialReady.has('suppliers')
      ) {
        hasNotifiedInitialLoad = true;
        callbacks.onInitialDataLoaded?.();
      }
    };

    const safetyTimer = setTimeout(() => {
      if (!hasNotifiedInitialLoad) {
        hasNotifiedInitialLoad = true;
        callbacks.onInitialDataLoaded?.();
      }
    }, 1500);

    const notifySynced = () => {
      callbacks.onSyncStateChange?.({
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        lastError: null,
        syncedCounts: { ...counts } as CloudSyncState['syncedCounts']
      });
    };

    const canonicalRole = normalizeCanonicalRole(authOptions?.userRole ?? 'client');
    if (canonicalRole === 'unauthorized') {
      clearTimeout(safetyTimer);
      callbacks.onProductsUpdate?.([]);
      callbacks.onCustomersUpdate?.([]);
      callbacks.onInvoicesUpdate?.([]);
      callbacks.onRestockOrdersUpdate?.([]);
      callbacks.onCustomerOrdersUpdate?.([]);
      callbacks.onAuditLogsUpdate?.([]);
      callbacks.onWholesalersUpdate?.([]);
      callbacks.onEmployeesUpdate?.([]);
      callbacks.onSuppliersUpdate?.([]);
      callbacks.onRestockLogsUpdate?.([]);
      callbacks.onInitialDataLoaded?.();
      return () => {};
    }

    const isCrewRole = canonicalRole === 'crew';
    const isWholesalerRole = canonicalRole === 'wholesaler_admin';
    const canManageStoreRole =
      canonicalRole === 'super_admin' ||
      canonicalRole === 'ellix_admin' ||
      canonicalRole === 'client';
    const crewUid = authOptions?.userUid;

    type Spec = {
      table: StoreTable;
      countKey: string;
      enabled: boolean;
      required?: boolean;
      filter?: { column: string; value: string };
      accept?: (row: any) => boolean;
      onUpdate?: (rows: any[]) => void;
    };

    const specs: Spec[] = [
      {
        table: 'products',
        countKey: 'products',
        enabled: true,
        required: true,
        filter: isWholesalerRole
          ? { column: 'data->>sharedWithWholesalers', value: 'true' }
          : undefined,
        accept: isWholesalerRole
          ? row => row?.sharedWithWholesalers === true
          : undefined,
        onUpdate: callbacks.onProductsUpdate
      },
      {
        table: 'customers',
        countKey: 'customers',
        enabled: canManageStoreRole,
        required: true,
        onUpdate: callbacks.onCustomersUpdate
      },
      {
        table: 'invoices',
        countKey: 'invoices',
        enabled: canManageStoreRole || (isCrewRole && Boolean(crewUid)),
        required: true,
        filter:
          isCrewRole && crewUid
            ? { column: 'data->>cashierId', value: crewUid }
            : undefined,
        accept:
          isCrewRole && crewUid
            ? row => row?.cashierId === crewUid
            : undefined,
        onUpdate: callbacks.onInvoicesUpdate
      },
      {
        table: 'restock_orders',
        countKey: 'restockOrders',
        enabled: canManageStoreRole || isWholesalerRole,
        onUpdate: callbacks.onRestockOrdersUpdate
      },
      {
        table: 'customer_orders',
        countKey: 'customerOrders',
        enabled: canManageStoreRole,
        onUpdate: callbacks.onCustomerOrdersUpdate
      },
      {
        table: 'audit_logs',
        countKey: 'auditLogs',
        enabled: canManageStoreRole,
        onUpdate: callbacks.onAuditLogsUpdate
      },
      {
        table: 'wholesalers',
        countKey: 'wholesalers',
        enabled: canManageStoreRole,
        onUpdate: callbacks.onWholesalersUpdate
      },
      {
        table: 'employees',
        countKey: 'employees',
        enabled: canManageStoreRole,
        onUpdate: callbacks.onEmployeesUpdate
      },
      {
        table: 'suppliers',
        countKey: 'suppliers',
        enabled: canManageStoreRole || isCrewRole,
        required: true,
        onUpdate: callbacks.onSuppliersUpdate
      },
      {
        table: 'restock_logs',
        countKey: 'restockLogs',
        enabled: canManageStoreRole || isCrewRole,
        onUpdate: callbacks.onRestockLogsUpdate
      }
    ];

    for (const spec of specs) {
      if (!spec.enabled) {
        spec.onUpdate?.([]);
        if (spec.required) checkInitialLoad(spec.countKey);
        continue;
      }

      if (spec.filter) this.rowFilters[spec.table] = spec.filter;
      this.rows[spec.table] = [];

      this.loadTable(spec.table, storeId, spec.filter)
        .then(rows => {
          if (this.storeId !== storeId) return;
          this.rows[spec.table] = rows;
          counts[spec.countKey] = rows.length;
          spec.onUpdate?.(rows);
          if (spec.table === 'invoices') {
            reconcileStoreInvoiceCounter(storeId, rows);
          }
          notifySynced();
          if (spec.required) checkInitialLoad(spec.countKey);
        })
        .catch(err => {
          console.warn(`[SupabaseSync] ${spec.table} load warning:`, err?.message || err);
          callbacks.onSyncStateChange?.({
            status: isOfflineFailure(err) ? 'offline' : 'error',
            lastError: err?.message || String(err)
          });
          if (spec.required) checkInitialLoad(spec.countKey);
        });
    }

    if (canManageStoreRole || (isCrewRole && crewUid)) {
      this.loadInvoiceCounter(storeId).catch(err =>
        console.warn('[SupabaseSync] Invoice counter load warning:', err?.message || err)
      );
    }

    // Realtime fan-out: one channel, one binding per table, filtered by store.
    try {
      let channel = supabase.channel(`store-sync-${storeId}`);
      for (const spec of specs) {
        if (!spec.enabled) continue;
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: spec.table,
            filter: `store_id=eq.${storeId}`
          },
          (payload: any) => {
            if (this.storeId !== storeId) return;
            this.applyRealtimeChange(spec, payload, counts, notifySynced);
          }
        );
      }

      if (canManageStoreRole || (isCrewRole && crewUid)) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'store_counters',
            filter: `store_id=eq.${storeId}`
          },
          (payload: any) => {
            if (this.storeId !== storeId) return;
            const state = payload?.new?.data;
            if (state && typeof state === 'object') {
              reconcileStoreInvoiceCounter(storeId, undefined, state as Partial<StoreInvoiceCounterState>);
            }
          }
        );
      }

      this.realtimeChannel = channel.subscribe((status: string) => {
        if (this.storeId !== storeId) return;
        if (status === 'SUBSCRIBED') {
          notifySynced();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          callbacks.onSyncStateChange?.({
            status: 'offline',
            lastError: `Realtime ${status.toLowerCase().replace('_', ' ')}`
          });
        }
      });
    } catch (err: any) {
      console.warn('[SupabaseSync] Realtime setup warning:', err?.message || err);
    }

    // Flush any queued offline modifications
    this.flushQueue();

    return () => {
      clearTimeout(safetyTimer);
      this.unsubscribeAll();
    };
  }

  public unsubscribeAll(): void {
    if (this.realtimeChannel) {
      try {
        supabase.removeChannel(this.realtimeChannel);
      } catch {}
      this.realtimeChannel = null;
    }
    this.unsubs.forEach(unsub => {
      try {
        unsub();
      } catch {}
    });
    this.unsubs = [];
    this.rows = {};
    this.rowFilters = {};
    this.storeId = '';
    this.currentListeners = null;
  }

  private applyRealtimeChange(
    spec: { table: StoreTable; countKey: string; accept?: (row: any) => boolean; onUpdate?: (rows: any[]) => void },
    payload: any,
    counts: Record<string, number>,
    notifySynced: () => void
  ): void {
    const row = payload?.eventType === 'DELETE' ? payload?.old : payload?.new?.data;
    const id = payload?.eventType === 'DELETE' ? payload?.old?.id : payload?.new?.id;
    if (!id) return;

    const list = this.rows[spec.table] || [];
    const next = list.filter(item => item?.id !== id);

    if (payload?.eventType !== 'DELETE' && row && (!spec.accept || spec.accept(row))) {
      next.push(row);
    }

    const sorted = sortById(next);
    this.rows[spec.table] = sorted;
    counts[spec.countKey] = sorted.length;
    spec.onUpdate?.(sorted);
    notifySynced();
  }

  private async loadTable(
    table: StoreTable,
    storeId: string,
    filter?: { column: string; value: string }
  ): Promise<any[]> {
    let request = supabase.from(table).select('id,data').eq('store_id', storeId);
    if (filter) request = request.filter(filter.column, 'eq', filter.value);
    const { data, error } = await request.order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => row.data).filter(Boolean);
  }

  private async loadInvoiceCounter(storeId: string): Promise<void> {
    const { data, error } = await supabase
      .from('store_counters')
      .select('data')
      .eq('store_id', storeId)
      .maybeSingle();
    if (error) throw error;
    if (data?.data) {
      reconcileStoreInvoiceCounter(storeId, undefined, data.data as Partial<StoreInvoiceCounterState>);
    }
  }

  private async readDoc(table: StoreTable | 'stores', storeId: string, id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from(table)
      .select('data')
      .eq('store_id', storeId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  }

  // Supabase upsert replaces the whole JSON document, so merge explicitly to
  // preserve the document-store `{ merge: true }` semantics for partial updates.
  private async upsertDoc(
    table: StoreTable | 'stores',
    storeId: string,
    id: string,
    data: Record<string, any>
  ): Promise<void> {
    const clean = sanitizeData({ ...data, id, storeId });
    const existing = await this.readDoc(table, storeId, id);
    const merged =
      existing && typeof existing === 'object' ? { ...existing, ...clean } : clean;
    const { error } = await supabase
      .from(table)
      .upsert({ id, store_id: storeId, data: merged }, { onConflict: 'store_id,id' });
    if (error) throw error;
  }

  private async insertDoc(
    table: StoreTable | 'stores',
    storeId: string,
    id: string,
    data: Record<string, any>
  ): Promise<void> {
    const clean = sanitizeData({ ...data, id, storeId });
    const { error } = await supabase
      .from(table)
      .upsert({ id, store_id: storeId, data: clean }, { onConflict: 'store_id,id' });
    if (error) throw error;
  }

  private async deleteDoc(table: StoreTable | 'stores', storeId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('store_id', storeId)
      .eq('id', id);
    if (error) throw error;
  }

  private async seedTable(
    table: StoreTable,
    storeId: string,
    items: any[],
    transform?: (item: any) => Record<string, any>
  ): Promise<number> {
    const realItems = stripMockFixtures(items || []);
    if (realItems.length === 0) return 0;

    const rows = realItems.map(item => ({
      id: item.id,
      store_id: storeId,
      data: sanitizeData(
        transform ? transform(item) : { ...item, id: item.id, storeId }
      )
    }));

    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase
        .from(table)
        .upsert(rows.slice(i, i + 500), { onConflict: 'store_id,id' });
      if (error) throw error;
    }
    return rows.length;
  }

  // --------------------------------------------------------------------------
  // Seeders (Never writes static mockData fixtures to production)
  // --------------------------------------------------------------------------
  public async seedProducts(storeId: string, items: Product[]): Promise<void> {
    try {
      const count = await this.seedTable('products', storeId, items);
      if (count > 0) console.log(`[SupabaseSync] Seeded ${count} products to store ${storeId}`);
    } catch (e) {
      console.warn('[SupabaseSync] Seeding products failed or postponed:', e);
    }
  }

  public async seedCustomers(storeId: string, items: CustomerProfile[]): Promise<void> {
    try {
      await this.seedTable('customers', storeId, items);
    } catch (e) {
      console.warn('[SupabaseSync] Seeding customers postponed:', e);
    }
  }

  public async seedInvoices(storeId: string, items: POSInvoice[]): Promise<void> {
    try {
      const realItems = stripMockFixtures(items);
      if (realItems.length === 0) return;
      reconcileStoreInvoiceCounter(storeId, realItems);
      await this.seedTable('invoices', storeId, realItems, item =>
        sanitizeData({ ...item, totalAmount: item.grandTotal, storeId })
      );
    } catch (e) {
      console.warn('[SupabaseSync] Seeding invoices postponed:', e);
    }
  }

  public async seedRestockOrders(storeId: string, items: RestockOrder[]): Promise<void> {
    try {
      await this.seedTable('restock_orders', storeId, items, item =>
        sanitizeData({
          ...item,
          orderNumber: item.id,
          quantity: item.suggestedQty || item.quotedQty || 1,
          storeId
        })
      );
    } catch (e) {
      console.warn('[SupabaseSync] Seeding restock orders postponed:', e);
    }
  }

  public async seedCustomerOrders(storeId: string, items: CustomerOrder[]): Promise<void> {
    try {
      await this.seedTable('customer_orders', storeId, items);
    } catch (e) {
      console.warn('[SupabaseSync] Seeding customer orders postponed:', e);
    }
  }

  public async seedAuditLogs(storeId: string, items: AuditLog[]): Promise<void> {
    try {
      await this.seedTable('audit_logs', storeId, items);
    } catch (e) {
      console.warn('[SupabaseSync] Seeding audit logs postponed:', e);
    }
  }

  public async seedWholesalers(storeId: string, items: Wholesaler[]): Promise<void> {
    try {
      await this.seedTable('wholesalers', storeId, items);
    } catch (e) {
      console.warn('[SupabaseSync] Seeding wholesalers postponed:', e);
    }
  }

  public async seedEmployees(storeId: string, items: Employee[]): Promise<void> {
    try {
      await this.seedTable('employees', storeId, items);
    } catch (e) {
      console.warn('[SupabaseSync] Seeding employees postponed:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Document Level Mutators (Saved to Supabase with Offline Fallback)
  // --------------------------------------------------------------------------

  public async syncProduct(storeId: string, product: Product): Promise<void> {
    this.notifyFeedback('saving', 'Saving product changes...');
    const sanitized = sanitizeData({ ...product, storeId, updatedAt: new Date().toISOString() });
    try {
      await this.upsertDoc('products', storeId, product.id, sanitized);
      this.notifyFeedback('saved', 'Product saved');
    } catch (err) {
      console.warn('[SupabaseSync] Network write failed, queuing product offline:', err);
      queueOfflineAction({
        collection: 'products',
        action: 'update',
        docId: product.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async deleteProduct(storeId: string, productId: string): Promise<void> {
    this.notifyFeedback('saving', 'Removing product...');
    try {
      await this.deleteDoc('products', storeId, productId);
      this.notifyFeedback('saved', 'Product removed');
    } catch (err) {
      queueOfflineAction({
        collection: 'products',
        action: 'delete',
        docId: productId
      });
      this.notifyFeedback('error', 'Removed locally. Will sync when connected.');
    }
  }

  public async syncCustomer(storeId: string, customer: CustomerProfile): Promise<void> {
    this.notifyFeedback('saving', 'Saving customer details...');
    const sanitized = sanitizeData({ ...customer, storeId, updatedAt: new Date().toISOString() });
    try {
      await this.upsertDoc('customers', storeId, customer.id, sanitized);
      this.notifyFeedback('saved', 'Customer details saved');
    } catch (err) {
      queueOfflineAction({
        collection: 'customers',
        action: 'update',
        docId: customer.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async deleteCustomer(storeId: string, customerId: string): Promise<void> {
    this.notifyFeedback('saving', 'Removing customer...');
    try {
      await this.deleteDoc('customers', storeId, customerId);
      this.notifyFeedback('saved', 'Customer removed');
    } catch (err) {
      queueOfflineAction({
        collection: 'customers',
        action: 'delete',
        docId: customerId
      });
      this.notifyFeedback('error', 'Removed locally. Will sync when connected.');
    }
  }

  public reconcileStoreInvoiceCounter(
    storeId: string,
    existingInvoices?: Array<{ id?: string; invoiceNumber?: string; storeId?: string }>
  ): StoreInvoiceCounterState {
    return reconcileStoreInvoiceCounter(storeId, existingInvoices);
  }

  public reserveStoreInvoiceNumber(
    storeId: string,
    invoiceId: string,
    dateStr?: string,
    existingInvoices?: Array<{ id?: string; invoiceNumber?: string; storeId?: string }>
  ): string {
    return reserveStoreInvoiceNumber(storeId, invoiceId, dateStr, existingInvoices);
  }

  public releaseStoreInvoiceNumberReservation(storeId: string, invoiceId: string): void {
    releaseStoreInvoiceNumberReservation(storeId, invoiceId);
  }

  private async reserveRemoteInvoiceNumber(
    storeId: string,
    invoiceId: string,
    dateStr?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('reserve_invoice_number', {
      p_store_id: storeId,
      p_invoice_id: invoiceId,
      p_invoice_date: dateStr || null
    });
    if (error) throw error;
    return String(data);
  }

  private async upsertInvoiceRow(storeId: string, invoice: POSInvoice): Promise<void> {
    if (!invoice.invoiceNumber) {
      invoice.invoiceNumber = await this.reserveRemoteInvoiceNumber(storeId, invoice.id, invoice.date);
    }
    const payload = sanitizeData({
      ...invoice,
      storeId,
      totalAmount: invoice.grandTotal,
      updatedAt: new Date().toISOString()
    });
    try {
      await this.upsertDoc('invoices', storeId, invoice.id, payload);
    } catch (err: any) {
      // A stale local counter can collide with an already-used number.
      if (String(err?.code) === '23505') {
        invoice.invoiceNumber = await this.reserveRemoteInvoiceNumber(storeId, invoice.id, invoice.date);
        await this.upsertDoc('invoices', storeId, invoice.id, {
          ...payload,
          invoiceNumber: invoice.invoiceNumber
        });
        return;
      }
      throw err;
    }
  }

  public async syncInvoice(storeId: string, invoice: POSInvoice): Promise<void> {
    this.notifyFeedback('saving', 'Saving invoice...');
    const cleanStoreId = storeId || invoice.storeId || 'store-1';
    try {
      await this.upsertInvoiceRow(cleanStoreId, invoice);
      commitStoreInvoiceNumber(cleanStoreId, invoice.id, invoice.invoiceNumber);
      this.notifyFeedback('saved', 'Invoice saved');
    } catch (err: any) {
      console.warn('[SupabaseSync] Invoice write failed, queuing offline:', err);
      queueOfflineAction({
        collection: 'invoices',
        action: 'update',
        docId: invoice.id,
        data: sanitizeData({
          ...invoice,
          storeId: cleanStoreId,
          totalAmount: invoice.grandTotal,
          updatedAt: new Date().toISOString()
        })
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async deleteInvoice(storeId: string, invoiceId: string): Promise<void> {
    try {
      await this.deleteDoc('invoices', storeId, invoiceId);
    } catch (err) {
      queueOfflineAction({
        collection: 'invoices',
        action: 'delete',
        docId: invoiceId
      });
    }
  }

  private async fetchProductsByIds(storeId: string, productIds: string[]): Promise<Product[]> {
    const ids = Array.from(new Set((productIds || []).filter(Boolean)));
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('products')
      .select('id,data')
      .eq('store_id', storeId)
      .in('id', ids);
    if (error) throw error;
    return (data || []).map((row: any) => row.data).filter(Boolean) as Product[];
  }

  private async commitPOSSaleBundle(
    storeId: string,
    invoice: POSInvoice,
    bundle: { updatedProducts?: Product[]; updatedCustomer?: CustomerProfile; auditLog?: AuditLog }
  ): Promise<{
    alreadyCommitted: boolean;
    invoiceNumber?: string;
    products?: Product[];
    customer?: CustomerProfile;
  }> {
    // Stock is derived from the invoice items server-side; p_products is kept
    // for signature compatibility and intentionally not trusted.
    const { data, error } = await supabase.rpc('sync_pos_sale_atomic', {
      p_store_id: storeId,
      p_invoice: sanitizeData({ ...invoice, storeId }),
      p_products: [],
      p_customer: bundle.updatedCustomer
        ? sanitizeData({ ...bundle.updatedCustomer, storeId })
        : null,
      p_audit_log: bundle.auditLog
        ? sanitizeData({ ...bundle.auditLog, storeId })
        : null
    });
    if (error) throw error;
    return (data || {}) as any;
  }

  public async syncPOSSaleAtomic(
    storeId: string,
    invoice: POSInvoice,
    updatedProducts: Product[],
    updatedCustomer?: CustomerProfile,
    auditLog?: AuditLog
  ): Promise<Product[]> {
    this.notifyFeedback('saving', 'Processing transaction...');
    const cleanStoreId = storeId || invoice.storeId || 'store-1';

    // 1. Aggregate requested quantities per productId from invoice items
    const requestedByProduct = new Map<string, { quantity: number; productName: string }>();
    for (const item of invoice.items || []) {
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        releaseStoreInvoiceNumberReservation(cleanStoreId, invoice.id);
        const err = new InsufficientStockError(
          `Invalid sale quantity (${item.quantity}) for "${item.productName || item.productId}".`,
          { productId: item.productId, requestedQuantity: qty }
        );
        this.notifyFeedback('error', err.message);
        throw err;
      }
      const existing = requestedByProduct.get(item.productId);
      requestedByProduct.set(item.productId, {
        quantity: (existing?.quantity || 0) + qty,
        productName: item.productName || existing?.productName || item.productId
      });
    }

    const updatedProductsMap = new Map<string, Product>((updatedProducts || []).map(p => [p.id, p]));

    // Ensure no caller-supplied product stock is negative
    for (const [productId, req] of requestedByProduct.entries()) {
      const localProd = updatedProductsMap.get(productId);
      if (localProd && Number(localProd.stock) < 0) {
        releaseStoreInvoiceNumberReservation(cleanStoreId, invoice.id);
        const err = new InsufficientStockError(
          `Insufficient stock for "${localProd.name || req.productName}".`,
          {
            productId,
            availableStock: Math.max(0, Number(localProd.stock) + req.quantity),
            requestedQuantity: req.quantity
          }
        );
        this.notifyFeedback('error', err.message);
        throw err;
      }
    }

    // Ensure invoice has a local tentative reservation before committing
    const previousTentativeNumber = invoice.invoiceNumber;
    if (!invoice.invoiceNumber) {
      invoice.invoiceNumber = reserveStoreInvoiceNumber(cleanStoreId, invoice.id, invoice.date);
    }

    const effectiveAuditLog: AuditLog = auditLog || {
      id: `log-${invoice.id}`,
      user: invoice.cashierName || invoice.createdBy || 'POS Cashier',
      role: 'client',
      action: 'POS Invoice Created',
      details: `Invoice ${invoice.invoiceNumber} created for ${invoice.customerName || 'Walk-in Retail Customer'} (₹${invoice.grandTotal})`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: '127.0.0.1',
      status: 'success'
    };

    try {
      const txResult = await this.commitPOSSaleBundle(cleanStoreId, invoice, {
        updatedProducts,
        updatedCustomer,
        auditLog: effectiveAuditLog
      });

      if (txResult.invoiceNumber) {
        const committedNumber = txResult.invoiceNumber;
        invoice.invoiceNumber = committedNumber;
        commitStoreInvoiceNumber(cleanStoreId, invoice.id, committedNumber);

        if (
          previousTentativeNumber &&
          previousTentativeNumber !== committedNumber &&
          effectiveAuditLog.details.includes(previousTentativeNumber)
        ) {
          effectiveAuditLog.details = effectiveAuditLog.details.replace(
            previousTentativeNumber,
            committedNumber
          );
          // The RPC already inserted the audit row; correct its text if the
          // number changed during collision self-healing.
          this.upsertDoc('audit_logs', cleanStoreId, effectiveAuditLog.id, effectiveAuditLog).catch(
            () => {}
          );
        }
      }

      if (updatedCustomer && txResult.customer) {
        Object.assign(updatedCustomer, txResult.customer);
      }
      if (auditLog) {
        Object.assign(auditLog, effectiveAuditLog);
      }

      let products = Array.isArray(txResult.products) ? txResult.products : [];
      if (products.length === 0 && txResult.alreadyCommitted) {
        products = await this.fetchProductsByIds(
          cleanStoreId,
          (invoice.items || []).map(item => item.productId)
        );
      }

      this.notifyFeedback('saved', 'Transaction saved');
      return products;
    } catch (err: any) {
      const detail = parseRpcDetail(err);
      const code = detail.code || err?.code;

      // Validation / stock rejections are never queued offline.
      if (code === 'INSUFFICIENT_STOCK' || code === 'INVALID_QUANTITY') {
        releaseStoreInvoiceNumberReservation(cleanStoreId, invoice.id);
        const stockErr = new InsufficientStockError(err?.message || 'Insufficient stock', {
          productId: detail.productId,
          availableStock: detail.availableStock !== undefined ? Number(detail.availableStock) : undefined,
          requestedQuantity:
            detail.requestedQuantity !== undefined ? Number(detail.requestedQuantity) : undefined
        });
        this.notifyFeedback('error', stockErr.message);
        throw stockErr;
      }

      if (code === 'EMPTY_CART' || code === 'PRODUCT_NOT_FOUND' || String(err?.code) === '42501') {
        releaseStoreInvoiceNumberReservation(cleanStoreId, invoice.id);
        const message =
          code === 'EMPTY_CART'
            ? 'Cannot create an invoice with an empty cart.'
            : err?.message || 'Transaction rejected.';
        this.notifyFeedback('error', message);
        throw new Error(message);
      }

      if (!isOfflineFailure(err)) {
        releaseStoreInvoiceNumberReservation(cleanStoreId, invoice.id);
        this.notifyFeedback('error', err?.message || 'Transaction failed.');
        throw err;
      }

      console.warn('[SupabaseSync] POS sale failed while offline, queuing atomic bundle:', err);
      const nowIso = new Date().toISOString();
      const offlineInvoiceNumber = reserveStoreInvoiceNumber(cleanStoreId, invoice.id, invoice.date);

      if (
        effectiveAuditLog &&
        invoice.invoiceNumber &&
        invoice.invoiceNumber !== offlineInvoiceNumber &&
        effectiveAuditLog.details.includes(invoice.invoiceNumber)
      ) {
        effectiveAuditLog.details = effectiveAuditLog.details.replace(
          invoice.invoiceNumber,
          offlineInvoiceNumber
        );
      }
      invoice.invoiceNumber = offlineInvoiceNumber;
      if (auditLog) {
        Object.assign(auditLog, effectiveAuditLog);
      }

      queueOfflineAction({
        collection: 'invoices',
        action: 'create',
        docId: invoice.id,
        data: sanitizeData({
          ...invoice,
          invoiceNumber: offlineInvoiceNumber,
          totalAmount: invoice.grandTotal,
          storeId: cleanStoreId,
          updatedAt: nowIso,
          _posSaleBundle: {
            updatedProducts: updatedProducts.map(p => sanitizeData({ ...p, storeId: cleanStoreId })),
            updatedCustomer: updatedCustomer
              ? sanitizeData({ ...updatedCustomer, storeId: cleanStoreId })
              : undefined,
            auditLog: sanitizeData({ ...effectiveAuditLog, storeId: cleanStoreId })
          }
        })
      });
      for (const p of updatedProducts) {
        queueOfflineAction({
          collection: 'products',
          action: 'update',
          docId: p.id,
          data: sanitizeData({
            ...p,
            storeId: cleanStoreId,
            updatedAt: nowIso,
            _parentInvoiceId: invoice.id
          })
        });
      }
      if (updatedCustomer) {
        queueOfflineAction({
          collection: 'customers',
          action: 'update',
          docId: updatedCustomer.id,
          data: sanitizeData({
            ...updatedCustomer,
            storeId: cleanStoreId,
            updatedAt: nowIso,
            _parentInvoiceId: invoice.id
          })
        });
      }
      queueOfflineAction({
        collection: 'auditLogs',
        action: 'create',
        docId: effectiveAuditLog.id,
        data: sanitizeData({
          ...effectiveAuditLog,
          storeId: cleanStoreId,
          _parentInvoiceId: invoice.id
        })
      });
      this.notifyFeedback('error', 'Transaction saved offline. Will sync when connected.');
      return updatedProducts;
    }
  }

  // Restock orders
  public async syncRestockOrder(storeId: string, order: RestockOrder): Promise<void> {
    this.notifyFeedback('saving', 'Saving restock order...');
    const sanitized = sanitizeData({
      ...order,
      orderNumber: order.id,
      quantity: order.suggestedQty || order.quotedQty || 1,
      storeId,
      updatedAt: new Date().toISOString()
    });
    try {
      await this.upsertDoc('restock_orders', storeId, order.id, sanitized);
      this.notifyFeedback('saved', 'Restock order saved');
    } catch (err) {
      queueOfflineAction({
        collection: 'restockOrders',
        action: 'update',
        docId: order.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async syncCustomerOrder(storeId: string, order: CustomerOrder): Promise<void> {
    this.notifyFeedback('saving', 'Saving order status...');
    const sanitized = sanitizeData({ ...order, storeId, updatedAt: new Date().toISOString() });
    try {
      await this.upsertDoc('customer_orders', storeId, order.id, sanitized);
      this.notifyFeedback('saved', 'Order updated');
    } catch (err) {
      queueOfflineAction({
        collection: 'customerOrders',
        action: 'update',
        docId: order.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async syncAuditLog(storeId: string, log: AuditLog): Promise<void> {
    try {
      await this.upsertDoc('audit_logs', storeId, log.id, { ...log, storeId });
    } catch (err) {
      queueOfflineAction({
        collection: 'auditLogs',
        action: 'create',
        docId: log.id,
        data: sanitizeData({ ...log, storeId })
      });
    }
  }

  public async syncWholesaler(storeId: string, wholesaler: Wholesaler): Promise<void> {
    this.notifyFeedback('saving', 'Saving supplier details...');
    const sanitized = sanitizeData({ ...wholesaler, storeId, updatedAt: new Date().toISOString() });
    try {
      await this.upsertDoc('wholesalers', storeId, wholesaler.id, sanitized);
      this.notifyFeedback('saved', 'Supplier saved');
    } catch (err) {
      queueOfflineAction({
        collection: 'wholesalers',
        action: 'update',
        docId: wholesaler.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async deleteWholesaler(storeId: string, wholesalerId: string): Promise<void> {
    this.notifyFeedback('saving', 'Removing supplier...');
    try {
      await this.deleteDoc('wholesalers', storeId, wholesalerId);
      this.notifyFeedback('saved', 'Supplier removed');
    } catch (err) {
      queueOfflineAction({
        collection: 'wholesalers',
        action: 'delete',
        docId: wholesalerId
      });
      this.notifyFeedback('error', 'Removed locally. Will sync when connected.');
    }
  }

  public async syncEmployee(storeId: string, employee: Employee): Promise<void> {
    this.notifyFeedback('saving', 'Saving staff member...');
    const sanitized = sanitizeData({ ...employee, storeId, updatedAt: new Date().toISOString() });
    try {
      await this.upsertDoc('employees', storeId, employee.id, sanitized);
      this.notifyFeedback('saved', 'Staff updated');
    } catch (err) {
      queueOfflineAction({
        collection: 'employees',
        action: 'update',
        docId: employee.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async deleteEmployee(storeId: string, employeeId: string): Promise<void> {
    this.notifyFeedback('saving', 'Removing staff member...');
    try {
      await this.deleteDoc('employees', storeId, employeeId);
      this.notifyFeedback('saved', 'Staff member removed');
    } catch (err) {
      queueOfflineAction({
        collection: 'employees',
        action: 'delete',
        docId: employeeId
      });
      this.notifyFeedback('error', 'Removed locally. Will sync when connected.');
    }
  }

  // Suppliers Management (Client/Owner only writes; Crew can read)
  public async syncSupplier(storeId: string, supplier: Supplier): Promise<void> {
    this.notifyFeedback('saving', 'Saving supplier details...');
    const sanitized = sanitizeData({ ...supplier, storeId, updatedAt: new Date().toISOString() });
    try {
      await this.upsertDoc('suppliers', storeId, supplier.id, sanitized);
      this.notifyFeedback('saved', 'Supplier saved');
    } catch (err) {
      this.notifyFeedback('error', 'Failed to save supplier to cloud.');
    }
  }

  public async deleteSupplier(storeId: string, supplierId: string): Promise<void> {
    this.notifyFeedback('saving', 'Removing supplier...');
    try {
      await this.deleteDoc('suppliers', storeId, supplierId);
      this.notifyFeedback('saved', 'Supplier removed');
    } catch (err) {
      this.notifyFeedback('error', 'Failed to remove supplier from cloud.');
    }
  }

  // Restock Logs (Audited inventory restock transactions)
  public async syncRestockLog(storeId: string, log: RestockLog): Promise<void> {
    this.notifyFeedback('saving', 'Recording restock log...');
    const sanitized = sanitizeData({
      ...log,
      storeId,
      quantity: log.quantity || log.quantityAdded || 0,
      createdAt: log.createdAt || log.date || new Date().toISOString()
    });
    try {
      await this.upsertDoc('restock_logs', storeId, log.id, sanitized);
      this.notifyFeedback('saved', 'Restock logged');
    } catch (err) {
      this.notifyFeedback('error', 'Failed to save restock log to cloud.');
    }
  }

  // Store Configuration
  public async syncStore(store: Store): Promise<void> {
    this.notifyFeedback('saving', 'Saving store configuration...');
    const sanitized = sanitizeData({ ...store, updatedAt: new Date().toISOString() });
    try {
      const { error } = await supabase.from('stores').upsert(
        {
          id: store.id,
          client_id: (store as any).clientId ?? null,
          owner_uid: (store as any).ownerUid ?? null,
          data: sanitized
        },
        { onConflict: 'id' }
      );
      if (error) throw error;
      this.notifyFeedback('saved', 'Store configuration saved');
    } catch (err) {
      queueOfflineAction({
        collection: 'stores',
        action: 'update',
        docId: store.id,
        data: sanitized
      });
      this.notifyFeedback('error', 'Saved offline. Will sync when connected.');
    }
  }

  public async flushQueue(): Promise<{ processed: number; remaining: number }> {
    const queue = getOfflineQueue();
    if (queue.length === 0) return { processed: 0, remaining: 0 };

    console.log(`[SupabaseSync] Flushing ${queue.length} pending offline items...`);
    const remaining: OfflineSyncItem[] = [];
    let processed = 0;
    const atomicallyHandledInvoiceIds = new Set<string>();
    const atomicallyFailedInvoiceIds = new Set<string>();

    for (const item of queue) {
      const parentInvoiceId = item.data?._parentInvoiceId;
      if (parentInvoiceId) {
        if (atomicallyHandledInvoiceIds.has(parentInvoiceId)) {
          processed++;
          continue;
        }
        if (atomicallyFailedInvoiceIds.has(parentInvoiceId)) {
          remaining.push(item);
          continue;
        }
      }

      try {
        const itemStoreId = item.data?.storeId || this.activeStoreId;
        if (item.collection === 'invoices' && item.action !== 'delete' && item.data) {
          const { _posSaleBundle, _parentInvoiceId: _ignoredParent, ...rawInvoiceData } = item.data;
          const invoicePayload: POSInvoice = {
            ...(rawInvoiceData as POSInvoice),
            id: item.docId || rawInvoiceData.id,
            storeId: itemStoreId
          };

          if (_posSaleBundle && typeof _posSaleBundle === 'object') {
            const txRes = await this.commitPOSSaleBundle(itemStoreId, invoicePayload, {
              updatedProducts: Array.isArray(_posSaleBundle.updatedProducts)
                ? _posSaleBundle.updatedProducts
                : [],
              updatedCustomer: _posSaleBundle.updatedCustomer as CustomerProfile | undefined,
              auditLog: _posSaleBundle.auditLog as AuditLog | undefined
            });
            if (txRes.invoiceNumber) {
              commitStoreInvoiceNumber(itemStoreId, invoicePayload.id, txRes.invoiceNumber);
            }
            atomicallyHandledInvoiceIds.add(invoicePayload.id);
            processed++;
            continue;
          }

          await this.upsertInvoiceRow(itemStoreId, invoicePayload);
          processed++;
          continue;
        }

        if (item.collection === 'stores') {
          const { _parentInvoiceId: _pId, ...cleanPayload } = item.data || {};
          if (item.action === 'delete') {
            const { error } = await supabase.from('stores').delete().eq('id', item.docId);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('stores')
              .upsert(
                {
                  id: item.docId,
                  client_id: cleanPayload.clientId ?? null,
                  owner_uid: cleanPayload.ownerUid ?? null,
                  data: sanitizeData({ ...cleanPayload, id: item.docId })
                },
                { onConflict: 'id' }
              );
            if (error) throw error;
          }
          processed++;
          continue;
        }

        const table = TABLE_BY_COLLECTION[item.collection];
        if (!table) throw new Error(`Unknown sync collection: ${item.collection}`);

        const { _parentInvoiceId: _parent, ...cleanPayload } = item.data || {};

        if (item.action === 'delete') {
          await this.deleteDoc(table, itemStoreId, item.docId);
        } else if (item.collection === 'customers') {
          const existing = await this.readDoc('customers', itemStoreId, item.docId);
          const customerExistsInCloud = Boolean(existing);
          if (customerExistsInCloud) {
            const isPosCustomer = Boolean(parentInvoiceId);
            // Crew POS writes only touch the loyalty/credit counters; a full
            // profile edit is merged field-by-field.
            const patch = isPosCustomer
              ? {
                  totalPurchases: cleanPayload.totalPurchases,
                  loyaltyPoints: cleanPayload.loyaltyPoints,
                  creditBalance: cleanPayload.creditBalance,
                  updatedAt: cleanPayload.updatedAt || new Date().toISOString()
                }
              : cleanPayload;
            await this.upsertDoc('customers', itemStoreId, item.docId, patch);
          } else {
            await this.upsertDoc('customers', itemStoreId, item.docId, cleanPayload);
          }
        } else {
          await this.upsertDoc(table, itemStoreId, item.docId, cleanPayload);
        }
        processed++;
      } catch (err) {
        if (item.collection === 'invoices' && item.data?._posSaleBundle) {
          const failedInvId = item.docId || item.data?.id;
          if (failedInvId) {
            atomicallyFailedInvoiceIds.add(failedInvId);
          }
          // Do not keep permanently rejected insufficient-stock sales in the queue
          if (isInsufficientStockError(err)) {
            if (failedInvId) {
              releaseStoreInvoiceNumberReservation(
                item.data?.storeId || this.activeStoreId,
                failedInvId
              );
              atomicallyHandledInvoiceIds.add(failedInvId);
              atomicallyFailedInvoiceIds.delete(failedInvId);
            }
            continue;
          }
        }
        remaining.push(item);
      }
    }

    saveOfflineQueue(remaining);
    return { processed, remaining: remaining.length };
  }
}

export const syncManager = new StoreSyncManager();
