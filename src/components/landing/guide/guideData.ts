import { LegalPageSlug } from '../../../config/legal.config';

export const GUIDE_STORAGE_KEYS = {
  CURRENT_STEP: 'ellix_guide_current_step',
  COMPLETED: 'ellix_guide_completed',
  DISMISSED: 'ellix_guide_dismissed',
  STARTED: 'ellix_guide_started',
} as const;

export interface GuideProgressState {
  currentStep: number; // 0 = Intro screen, 1..12 = Steps 1..12, 13 = Completion screen
  completed: boolean;
  dismissed: boolean;
  started: boolean;
}

export function loadGuideProgress(): GuideProgressState {
  if (typeof window === 'undefined') {
    return { currentStep: 0, completed: false, dismissed: false, started: false };
  }
  try {
    const rawStep = window.localStorage.getItem(GUIDE_STORAGE_KEYS.CURRENT_STEP);
    const parsedStep = rawStep !== null ? parseInt(rawStep, 10) : 0;
    const currentStep =
      !Number.isNaN(parsedStep) && parsedStep >= 0 && parsedStep <= 13 ? parsedStep : 0;
    const completed = window.localStorage.getItem(GUIDE_STORAGE_KEYS.COMPLETED) === 'true';
    const dismissed = window.localStorage.getItem(GUIDE_STORAGE_KEYS.DISMISSED) === 'true';
    const started = window.localStorage.getItem(GUIDE_STORAGE_KEYS.STARTED) === 'true';
    return { currentStep, completed, dismissed, started };
  } catch {
    return { currentStep: 0, completed: false, dismissed: false, started: false };
  }
}

export function saveGuideStep(step: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.CURRENT_STEP, String(step));
    if (step > 0) {
      window.localStorage.setItem(GUIDE_STORAGE_KEYS.STARTED, 'true');
    }
  } catch {
    // ignore storage errors
  }
}

export function markGuideCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.COMPLETED, 'true');
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.CURRENT_STEP, '13');
  } catch {
    // ignore storage errors
  }
}

export function markGuideDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.DISMISSED, 'true');
  } catch {
    // ignore storage errors
  }
}

export function resetGuideProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.CURRENT_STEP, '1');
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.COMPLETED, 'false');
    window.localStorage.setItem(GUIDE_STORAGE_KEYS.STARTED, 'true');
  } catch {
    // ignore storage errors
  }
}

export interface GuideChapter {
  stepNumber: number;
  code: string;
  shortTitle: string;
  title: string;
  breadcrumbCategory: string;
  breadcrumbTopic: string;
  whatIsIt: string;
  whyItMatters: string;
  howItWorks: string;
  whatHappensNext: string;
  keyTakeaway: string;
  interactivePrompt: string;
  exploreSectionHref: string;
  exploreSectionLabel: string;
  exploreTabHint?: string;
}

export const WORKFLOW_SEVEN_NODES = [
  { code: '01', label: 'Product', sub: 'Catalog & pricing' },
  { code: '02', label: 'Scanned', sub: 'Selected at counter' },
  { code: '03', label: 'Bill', sub: 'Tax & invoice ready' },
  { code: '04', label: 'Stock', sub: 'Inventory updated' },
  { code: '05', label: 'Payment', sub: 'Cash / UPI / Card' },
  { code: '06', label: 'Khata', sub: 'Customer ledger' },
  { code: '07', label: 'Insights', sub: 'Business visibility' },
] as const;

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    stepNumber: 1,
    code: '01',
    shortTitle: 'Meet Ellic',
    title: 'Meet Ellic',
    breadcrumbCategory: 'Overview',
    breadcrumbTopic: 'Connected Business Platform',
    whatIsIt:
      'Many everyday businesses manage bills, stock, customer records, payments, credit/Khata, and daily summaries across separate notebooks, calculators, or disconnected tools.',
    whyItMatters:
      'When records are separated, a single sale requires updating multiple places manually, leading to missed stock updates, unrecorded credit, or hours spent reconciling at night.',
    howItWorks:
      'Ellic brings billing, inventory, payments, customers, Khata, and business insights together into one connected workflow.',
    whatHappensNext:
      'Next, see how a Business Owner sets up their store environment inside Ellic.',
    keyTakeaway:
      'Instead of juggling disconnected methods for bills, stock, and customer credit, Ellic links them into one connected business workflow.',
    interactivePrompt: 'Click between "Before" and "With Ellic" to see how everyday operations connect →',
    exploreSectionHref: '#connected-workflow',
    exploreSectionLabel: 'Explore Connected Workflow →',
  },
  {
    stepNumber: 2,
    code: '02',
    shortTitle: 'Set Up Your Business',
    title: 'Set Up Your Business',
    breadcrumbCategory: 'Onboarding',
    breadcrumbTopic: 'Store & Operational Setup',
    whatIsIt:
      'The Client / Business Owner establishes and controls their own dedicated business environment inside Ellic.',
    whyItMatters:
      'Every store has its own catalog, staff members, suppliers, and customers. Keeping these structured from day one ensures clean daily operations.',
    howItWorks:
      'Setup follows a clear path: Business profile → Products → Inventory → Crew → Suppliers → Customers → Billing.',
    whatHappensNext:
      'Once your business environment is structured, you add the products that power your billing and stock.',
    keyTakeaway:
      'The Business Owner controls their own business environment, organizing products, inventory, crew, suppliers, and customers before billing begins.',
    interactivePrompt: 'Click any stage in the setup sequence below to inspect how the store environment is organized →',
    exploreSectionHref: '#how-it-works',
    exploreSectionLabel: 'Explore How It Works →',
  },
  {
    stepNumber: 3,
    code: '03',
    shortTitle: 'Products & Inventory',
    title: 'Products & Inventory',
    breadcrumbCategory: 'Catalog',
    breadcrumbTopic: 'Products & Stock Tracking',
    whatIsIt:
      'Products are the foundation of the business workflow. Each item stores its selling price, unit, stock count, and low-stock threshold.',
    whyItMatters:
      'Accurate product records mean you never have to memorize prices at the counter or guess how many units remain on the shelf.',
    howItWorks:
      'Add products, set prices, track availability, monitor stock counts, identify low-stock items, and restock when needed.',
    whatHappensNext:
      'With products in place, you can select or scan them to create a customer bill in seconds.',
    keyTakeaway:
      'Sales and restocking keep product availability connected to your everyday counter operations.',
    interactivePrompt: 'Try clicking "Simulate Sale" and "Simulate Restock" on the sample product below →',
    exploreSectionHref: '#features',
    exploreSectionLabel: 'Explore Inventory →',
  },
  {
    stepNumber: 4,
    code: '04',
    shortTitle: 'Create a Bill',
    title: 'Create a Bill',
    breadcrumbCategory: 'Billing',
    breadcrumbTopic: 'Create a Bill',
    whatIsIt:
      'Creating a bill is where everyday counter activity begins: turning selected products and quantities into a clear, itemized invoice.',
    whyItMatters:
      'Automatic calculation of line totals, applicable tax rules, and discounts reduces manual calculation mistakes at checkout.',
    howItWorks:
      'Select a product, adjust quantity, let the system calculate line totals, applicable taxes (where configured), and discounts, then print or deliver the bill digitally.',
    whatHappensNext:
      'Once the bill is generated, you record how the customer pays.',
    keyTakeaway:
      'Create a bill once, deliver it via print or digital channels, and let the connected workflow update your business records.',
    interactivePrompt: 'Adjust quantity, toggle tax/discount, and switch between Print and Digital Delivery below →',
    exploreSectionHref: '#product',
    exploreSectionLabel: 'Explore Billing →',
  },
  {
    stepNumber: 5,
    code: '05',
    shortTitle: 'Payments',
    title: 'Record Payments',
    breadcrumbCategory: 'Payments',
    breadcrumbTopic: 'Cash, Card, UPI & Split Settlement',
    whatIsIt:
      'Payment recording tracks how every bill is settled across your supported payment methods.',
    whyItMatters:
      'Recording the exact payment mode keeps your cash drawer, digital collections, and transaction history clear at the end of the day.',
    howItWorks:
      'Select the payment method used by the customer (Cash, Card, UPI, or Split Payment) and confirm to move the bill from Pending to Completed.',
    whatHappensNext:
      'If a regular customer buys on store credit or builds purchase history, it connects to Customers & Khata.',
    keyTakeaway:
      'Every recorded payment updates the bill status and keeps payment method totals organized for daily reconciliation.',
    interactivePrompt: 'Select a payment method and click "Record Payment" to see the transaction state update →',
    exploreSectionHref: '#features',
    exploreSectionLabel: 'Explore Payments →',
  },
  {
    stepNumber: 6,
    code: '06',
    shortTitle: 'Customers & Khata',
    title: 'Customers & Khata Ledger',
    breadcrumbCategory: 'Customers',
    breadcrumbTopic: 'Customer Records & Credit Balance',
    whatIsIt:
      'Customer management links purchases and credit (Khata) transactions to individual customer profiles.',
    whyItMatters:
      'Instead of paper credit diaries, maintaining a structured digital Khata balance helps track who owes what and when repayments are made.',
    howItWorks:
      'When a customer makes a credit purchase or repayment, their transaction record and updated balance adjust accordingly based on authorized access.',
    whatHappensNext:
      'Meanwhile, every item sold also affects your store inventory and restocking needs.',
    keyTakeaway:
      'Customer purchases and Khata credit entries stay organized in one record, accessible according to user role and permissions.',
    interactivePrompt: 'Try adding a sample ₹500 Khata transaction or recording a repayment below →',
    exploreSectionHref: '#product',
    exploreSectionLabel: 'Explore Customers & Khata →',
  },
  {
    stepNumber: 7,
    code: '07',
    shortTitle: 'Stock & Restocking',
    title: 'Stock Deduction & Restocking',
    breadcrumbCategory: 'Inventory',
    breadcrumbTopic: 'Low-Stock Alerts & Replenishment',
    whatIsIt:
      'Inventory is directly connected to billing so that completed sales reduce available stock counts and highlight items that need restocking.',
    whyItMatters:
      'Knowing when an item drops to a low-stock threshold helps prevent running out of everyday essentials.',
    howItWorks:
      'As sales reduce stock (e.g., 10 → 9), items reaching their threshold are flagged as Low Stock until a Business Owner or authorized team member records a restock (9 → 19).',
    whatHappensNext:
      'Next, see how different people in the ecosystem, from platform admins to store crew, have structured roles.',
    keyTakeaway:
      'Because inventory connects to billing, sales automatically reflect in stock counts and surface low-stock restock needs.',
    interactivePrompt: 'Step through the Sale → Low Stock Alert → Restock sequence in the interactive demo below →',
    exploreSectionHref: '#features',
    exploreSectionLabel: 'Explore Stock & Restocking →',
  },
  {
    stepNumber: 8,
    code: '08',
    shortTitle: 'Your Team & Roles',
    title: 'Team Hierarchy & Role Permissions',
    breadcrumbCategory: 'Roles & Access',
    breadcrumbTopic: 'Platform & Store Permission Levels',
    whatIsIt:
      'Ellic separates platform administration from individual store management and counter crew operations.',
    whyItMatters:
      'Business owners can let counter staff create bills and record payments without giving them permission to delete business records or access platform settings.',
    howItWorks:
      'Roles are structured across 4 distinct levels: Level 1 Super Admin & Level 2 Ellic Admin (platform operations), and Level 3 Client / Business Owner & Level 4 Crew (store operations).',
    whatHappensNext:
      'With your team operating daily billing and stock, their activity generates useful business insights.',
    keyTakeaway:
      'Role-based permissions ensure Crew members can perform daily counter tasks while sensitive business and platform controls remain restricted.',
    interactivePrompt: 'Switch between the 4 role levels and inspect the Crew Available vs Restricted actions below →',
    exploreSectionHref: '#who-its-for',
    exploreSectionLabel: 'Explore Team & Permissions →',
  },
  {
    stepNumber: 9,
    code: '09',
    shortTitle: 'Business Insights',
    title: 'From Daily Activity to Business Insights',
    breadcrumbCategory: 'Insights',
    breadcrumbTopic: 'Sales Trends & Operational Visibility',
    whatIsIt:
      'Every bill, payment, stock update, and customer transaction contributes to your store’s operational data.',
    whyItMatters:
      'Instead of guessing how the business performed, you can view sales trends, top-selling products, payment breakdowns, and stock health in one place.',
    howItWorks:
      'Bills + Payments + Inventory + Customers flow into structured Business Data, powering visual charts and summaries.',
    whatHappensNext:
      'Now let’s see the complete 7-step Connected Workflow come together in a single live sequence.',
    keyTakeaway:
      'Everyday business activity automatically becomes useful information for understanding store performance.',
    interactivePrompt: 'Click "Simulate Store Activity" to watch how new bills update the sample insight chart →',
    exploreSectionHref: '#product',
    exploreSectionLabel: 'Explore Insights →',
  },
  {
    stepNumber: 10,
    code: '10',
    shortTitle: 'Connected Workflow',
    title: 'The Complete Connected Workflow',
    breadcrumbCategory: 'Connected System',
    breadcrumbTopic: '01 Product → 07 Insights',
    whatIsIt:
      'This is the core of Ellic: Product, Scanned, Bill, Stock, Payment, Khata, and Insights operating as one continuous chain.',
    whyItMatters:
      'A single customer checkout at the counter updates multiple parts of the business workflow without duplicate data entry.',
    howItWorks:
      'When a customer buys a product: Product Selected → Bill Created → Tax Calculated → Stock Updated → Payment Recorded → Customer Record Updated → Business Insight Available.',
    whatHappensNext:
      'Next, understand how security, privacy, and access controls protect your business environment.',
    keyTakeaway:
      'One transaction can update multiple parts of the business workflow, connecting counter actions to business insights.',
    interactivePrompt: 'Click "Trigger Purchase Ripple" or select any node to trace one transaction across all 7 stages →',
    exploreSectionHref: '#connected-workflow',
    exploreSectionLabel: 'Explore Connected Workflow Section →',
  },
  {
    stepNumber: 11,
    code: '11',
    shortTitle: 'Subscriptions, Security & Data',
    title: 'Subscriptions, Security & Data',
    breadcrumbCategory: 'Trust & Lifecycle',
    breadcrumbTopic: 'Subscriptions, Security & Data',
    whatIsIt:
      'Ellic combines a transparent subscription lifecycle (Onboarding → Active → Renewal → Grace Period → Restricted if unresolved) with role-based security, store separation, and data privacy controls.',
    whyItMatters:
      'Business owners need clear rules on how their account stays active and how their store invoices, inventory, and customer records are protected.',
    howItWorks:
      'Store data is scoped by business and user role, backed by authentication, audit logging, and documented Terms of Service, Privacy Policy, Security, and Cancellation & Refund policies.',
    whatHappensNext:
      'Finally, move to Step 12 to review everything you have learned and choose your next step.',
    keyTakeaway:
      'Ellic is designed with role-based permissions, business separation, transparent subscription stages, and documented privacy and security policies.',
    interactivePrompt: 'Inspect the security pillars, subscription lifecycle stages, and official legal documents below →',
    exploreSectionHref: '#why-ellix',
    exploreSectionLabel: 'Explore Why Ellic →',
  },
  {
    stepNumber: 12,
    code: '12',
    shortTitle: 'Your Next Step',
    title: 'Your Next Step',
    breadcrumbCategory: 'Completion',
    breadcrumbTopic: 'Your Next Step',
    whatIsIt:
      'You have walked through the complete Ellic ecosystem: from setting up products and creating bills to recording payments, managing Khata, tracking stock, and viewing insights.',
    whyItMatters:
      'Now that you see how one business action connects across your entire store workflow, you can choose how to experience Ellic next.',
    howItWorks:
      'Explore the interactive Product Preview on the website, apply to get started with your business account, sign in to an existing workspace, or contact the Ellic team.',
    whatHappensNext:
      'Choose any action below or click "Finish Guide" to mark your guided tour as completed.',
    keyTakeaway:
      'You now understand how Ellic connects everyday business operations into one unified platform.',
    interactivePrompt: 'Select how you would like to continue exploring Ellic below →',
    exploreSectionHref: '#product',
    exploreSectionLabel: 'Explore Product Preview →',
  },
];

export interface GuideLegalLinkProps {
  onOpenLegalPage?: (slug: LegalPageSlug) => void;
}
