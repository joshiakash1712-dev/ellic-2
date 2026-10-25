import { JourneyStage, JourneyPainPoint, RetailerOnboardingProfile } from '../types/journey';

export const journeyStagesData: JourneyStage[] = [
  {
    id: 'awareness',
    label: 'Awareness',
    stepNumber: 1,
    timeframe: 'Day 1 - 5',
    mindset: 'How do peer merchants prevent counter rush bottlenecks, billing errors, and GST penalties without exorbitant upfront software costs?',
    primaryGoal: 'Discover modern retail OS capabilities; compare alternatives to manual registers and legacy offline desktop software.',
    sentimentScore: 1, // Neutral / Curious
    sentimentLabel: 'Curious but Skeptical',
    sentimentTrend: 'neutral',
    dropoffRate: 35,
    avgDaysInStage: 4,
    touchpoints: [
      {
        id: 'tp-aw-1',
        title: 'Wholesale Distributor Referral',
        channel: 'Peer Network',
        actor: 'Connected Wholesaler Sales Rep',
        description: 'Wholesaler recommends Ellic to retailer for instant digital restock POs and credit ledger sync.',
        deliverable: 'SMS / WhatsApp invite with free trial link',
        effectivenessScore: 4.8,
        isCriticalMilestone: true
      },
      {
        id: 'tp-aw-2',
        title: 'Field Agent Counter Demo',
        channel: 'Field Visit',
        actor: 'Ellic Merchant Growth Partner',
        description: '5-minute hands-on mobile barcode scan demonstration during afternoon non-rush hours.',
        deliverable: 'Laminated feature tear-sheet & sample QR bill',
        effectivenessScore: 4.5
      },
      {
        id: 'tp-aw-3',
        title: 'Regional Merchant Association Community',
        channel: 'WhatsApp',
        actor: 'Merchant Association President',
        description: 'Word-of-mouth endorsement and success stories from neighboring shopkeepers in the commercial hub.',
        deliverable: 'Case study video & ROI calculator preview',
        effectivenessScore: 4.2
      },
      {
        id: 'tp-aw-4',
        title: 'Web & Android Play Store Exploration',
        channel: 'Android App',
        actor: 'Self-Serve Retailer',
        description: 'Merchant downloads Android APK or opens Web applet to inspect screenshots and read reviews.',
        deliverable: 'Store registration form & instant sandbox login',
        effectivenessScore: 3.9
      }
    ],
    painPoints: [
      {
        id: 'pp-aw-1',
        stageId: 'awareness',
        title: 'Fear of Halting Counter Operations During Shift',
        category: 'Operations & Time',
        severity: 'critical',
        prevalencePercentage: 82,
        retailerQuote: '"If our counter freezes for just 10 minutes during the 7:30 PM evening rush, 30 impatient customers walk over to my competitor."',
        sourceContext: 'Survey of 120 kirana & grocery retail owners in Mumbai & Pune wholesale corridors',
        rootCause: 'Previous traumatic experiences with Windows-based desktop POS freezing or demanding mandatory OS updates during trade hours.',
        mitigationSolution: '100% Offline-First architecture that guarantees sub-second barcode scans and bill printing even with total internet blackout.',
        productFeatureKey: 'Offline-First SQLite Cache'
      },
      {
        id: 'pp-aw-2',
        stageId: 'awareness',
        title: 'Distrust of Recurring SaaS Subscriptions & Hidden Fees',
        category: 'Financial & Pricing',
        severity: 'high',
        prevalencePercentage: 74,
        retailerQuote: '"Sales reps promise a free app, but after 3 months lock your data until you pay thousands in annual cloud server fees."',
        sourceContext: 'In-depth interviews with multi-generation grocery owners',
        rootCause: 'Aggressive bait-and-switch billing practices by legacy retail software vendors.',
        mitigationSolution: 'Transparent forever-free single-outlet tier with local data export guarantee and zero lock-in.',
        productFeatureKey: 'Transparent Pricing & Free Tier'
      },
      {
        id: 'pp-aw-3',
        stageId: 'awareness',
        title: 'Hardware Cost Anxiety (Scanners, Printers, POS Machines)',
        category: 'Financial & Pricing',
        severity: 'medium',
        prevalencePercentage: 68,
        retailerQuote: '"Do I have to invest ₹25,000 in a heavy desktop computer, barcode gun, and specialized receipt machine?"',
        sourceContext: 'Field survey of tier-2 city retail prospects',
        rootCause: 'Belief that digital POS necessitates proprietary bulky hardware.',
        mitigationSolution: 'BYOD (Bring Your Own Device) mobile phone camera scanner + standard portable $20 Bluetooth thermal printer.',
        productFeatureKey: 'Mobile Phone Camera Barcode Engine'
      }
    ],
    milestoneChecklist: [
      { id: 'ms-aw-1', label: 'Initial Contact & Store Profile Registered', description: 'Retailer basic details (name, phone, segment) captured', isRequired: true },
      { id: 'ms-aw-2', label: 'Feature Walkthrough or Field Demo Completed', description: 'Counter staff saw 3-second bill creation demo', isRequired: true },
      { id: 'ms-aw-3', label: 'Trial Account Credentials Issued', description: 'Login details delivered via WhatsApp with 1-click magic link', isRequired: false }
    ],
    kpiMetrics: [
      { label: 'Trial Signup Rate', value: '42.8%', benchmark: 'Industry avg: 28%' },
      { label: 'Avg. First Demo Duration', value: '8.4 mins', benchmark: '< 10 mins target' },
      { label: 'Wholesale Referral Share', value: '61.2%', benchmark: 'High-intent channel' }
    ]
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    stepNumber: 2,
    timeframe: 'Day 6 - 12',
    mindset: 'Will this software handle my messy handwritten ledger, 2,500 loose stock items, and vernacular-speaking counter boys without crashing?',
    primaryGoal: 'Test live speed in sandbox; verify GST tax report accuracy; test printer compatibility; simulate rush hour billing.',
    sentimentScore: -2, // Anxious / Dip
    sentimentLabel: 'High Anxiety & Evaluation Friction',
    sentimentTrend: 'dip',
    dropoffRate: 48,
    avgDaysInStage: 6,
    touchpoints: [
      {
        id: 'tp-ev-1',
        title: 'Interactive 15-Minute Sandbox Trial',
        channel: 'Android App',
        actor: 'Retailer Owner & Manager',
        description: 'Merchant tests adding dummy items, scanning barcodes, and generating mock invoices.',
        deliverable: 'Pre-populated FMCG catalog sandbox environment',
        effectivenessScore: 4.6,
        isCriticalMilestone: true
      },
      {
        id: 'tp-ev-2',
        title: '1-on-1 Specialist Video / Voice Consultation',
        channel: 'Phone / Video',
        actor: 'Ellic Solutions Onboarding Engineer',
        description: 'Dedicated call addressing retailer specific product categories (loose grains, expiry batching, HSN codes).',
        deliverable: 'Customized store setup roadmap',
        effectivenessScore: 4.7
      },
      {
        id: 'tp-ev-3',
        title: 'Catalog Compatibility & Excel OCR Test',
        channel: 'Digital / Web',
        actor: 'Store Inventory Manager',
        description: 'Upload old Excel ledger or photo of handwritten wholesale bill to test automated parsing.',
        deliverable: 'Parsed 50-item sample catalog with mapped tax rates',
        effectivenessScore: 4.3,
        isCriticalMilestone: true
      },
      {
        id: 'tp-ev-4',
        title: 'Hardware Compatibility Test (Printer & Scanner)',
        channel: 'Hardware Box',
        actor: 'Ellic Field Technician / Courier',
        description: 'Testing Bluetooth pairing with merchant existing thermal printer or delivery of trial test printer.',
        deliverable: 'Diagnostic test bill printout with shop name & QR code',
        effectivenessScore: 4.4
      }
    ],
    painPoints: [
      {
        id: 'pp-ev-1',
        stageId: 'evaluation',
        title: 'Messy Handwritten Ledgers & Corrupted Excel Catalogs',
        category: 'Data & Inventory',
        severity: 'critical',
        prevalencePercentage: 88,
        retailerQuote: '"I have 1,800 items scribbled in Gujarati notebooks and three mismatched Excel sheets without standard barcodes. Typing them one-by-one is impossible."',
        sourceContext: 'Observation during 45 store onboarding visits',
        rootCause: 'Absence of standardized product codes; varied regional colloquial naming for FMCG and loose goods.',
        mitigationSolution: 'Pre-loaded 45,000 FMCG master SKU database with instant barcode lookup and AI assisted photo-to-catalog OCR.',
        productFeatureKey: 'Pre-loaded Master SKU Repository & OCR'
      },
      {
        id: 'pp-ev-2',
        stageId: 'evaluation',
        title: 'Counter Staff Resistance to Complex English UI',
        category: 'Tech & Usability',
        severity: 'high',
        prevalencePercentage: 79,
        retailerQuote: '"My billing boy studied up to 8th class. If he sees English dropdowns and ten nested menus, he panics and goes back to paper."',
        sourceContext: 'Retailer owner feedback sessions',
        rootCause: 'Enterprise software designed for desk-bound corporate accountants rather than fast-paced counter workers.',
        mitigationSolution: 'Vernacular voice search, high-contrast big-button POS layout, and icon-coded fast category tiles.',
        productFeatureKey: 'Fast Touch POS & Vernacular Keypad'
      },
      {
        id: 'pp-ev-3',
        stageId: 'evaluation',
        title: 'Unstable Broadband & Mobile Internet Drops',
        category: 'Tech & Usability',
        severity: 'critical',
        prevalencePercentage: 85,
        retailerQuote: '"During monsoon, roadside fiber cables get severed twice every month. If our POS requires an internet ping per bill, our store shuts down."',
        sourceContext: 'Technical connectivity telemetry in suburban commercial markets',
        rootCause: 'Cloud-dependent POS architectures making remote API requests on checkout button click.',
        mitigationSolution: 'Complete offline local transaction storage with automatic background synchronization when connection restores.',
        productFeatureKey: 'Offline POS with Background Sync Queue'
      },
      {
        id: 'pp-ev-4',
        stageId: 'evaluation',
        title: 'GST E-Invoicing & B2B Tax Compliance Confusion',
        category: 'Trust & Compliance',
        severity: 'medium',
        prevalencePercentage: 62,
        retailerQuote: '"Our chartered accountant warns us that wrong tax slabs or missing HSN codes will attract tax notices."',
        sourceContext: 'Tax compliance interviews with formalizing retailers',
        rootCause: 'Intricate and shifting tax rules across composite vs regular GST dealer tiers.',
        mitigationSolution: 'Pre-mapped HSN tax slabs (0%, 5%, 12%, 18%) and automated 1-click GSTR-1 & GSTR-3B export reports.',
        productFeatureKey: 'Automated GST Compliance Engine'
      }
    ],
    milestoneChecklist: [
      { id: 'ms-ev-1', label: 'Completed 10 Test Transactions in Sandbox', description: 'Tested cash, card, and UPI simulation', isRequired: true },
      { id: 'ms-ev-2', label: 'Sample Catalog Upload & Tax Mapping Verified', description: 'At least 50 core inventory items uploaded & verified', isRequired: true },
      { id: 'ms-ev-3', label: 'Bluetooth Thermal Printer Successfully Paired', description: 'Test receipt printed with correct store header & QR code', isRequired: true },
      { id: 'ms-ev-4', label: 'Pricing Plan Selected & Approved by Owner', description: 'Contract signed or starter tier confirmed', isRequired: false }
    ],
    kpiMetrics: [
      { label: 'Evaluation to Setup Conv.', value: '58.4%', benchmark: 'Industry avg: 41%' },
      { label: 'Avg. Time to 1st Test Bill', value: '14 mins', benchmark: '< 20 mins target' },
      { label: 'Catalog Upload Success Rate', value: '89.1%', benchmark: '> 85% target' }
    ]
  },
  {
    id: 'onboarding',
    label: 'Onboarding & Setup',
    stepNumber: 3,
    timeframe: 'Day 13 - 21',
    mindset: 'Let us set up the real store inventory, verify wholesale supplier connections, and train counter staff before flipping the switch.',
    primaryGoal: 'Complete store profile & GSTIN; import full product catalog; configure staff PIN roles; run staff training drill.',
    sentimentScore: 2, // Relieved & Productive
    sentimentLabel: 'Relieved, Focused & Building Momentum',
    sentimentTrend: 'rising',
    dropoffRate: 19,
    avgDaysInStage: 7,
    touchpoints: [
      {
        id: 'tp-ob-1',
        title: 'Welcome Concierge Call & Dedicated Onboarding Manager',
        channel: 'Phone / Video',
        actor: 'Dedicated Ellic Onboarding Specialist',
        description: 'Structured 30-minute kickoff verifying hardware arrival, store branches, and target go-live date.',
        deliverable: 'Go-live checklist & WhatsApp direct support channel',
        effectivenessScore: 4.9,
        isCriticalMilestone: true
      },
      {
        id: 'tp-ob-2',
        title: 'Automated Wholesaler Catalog Link-up',
        channel: 'Digital / Web',
        actor: 'Ellic B2B Network Router',
        description: 'Instant synchronization of 1,000+ FMCG SKUs directly from the retailer linked wholesale distributor.',
        deliverable: 'Populated wholesale catalog with negotiated buying prices',
        effectivenessScore: 4.8,
        isCriticalMilestone: true
      },
      {
        id: 'tp-ob-3',
        title: '20-Minute Staff Training & Fast-Billing Drill',
        channel: 'Field Visit',
        actor: 'Ellic Field Trainer or Video Simulator',
        description: 'Hands-on practice with cashiers: barcode scanning, handling change, applying discounts, and split payments.',
        deliverable: 'Cashier Quick-Reference Counter Card',
        effectivenessScore: 4.7
      },
      {
        id: 'tp-ob-4',
        title: 'Dry-Run Inventory Audit & Stock-In Drill',
        channel: 'Android App',
        actor: 'Store Manager & Inventory Staff',
        description: 'Physical count of top 100 fast-moving items, scanning barcodes and entering initial batch quantities.',
        deliverable: 'Verified starting stock valuation audit',
        effectivenessScore: 4.4
      }
    ],
    painPoints: [
      {
        id: 'pp-ob-1',
        stageId: 'onboarding',
        title: 'Dual-Running Fatigue (Running Paper Ledger + Software Concurrently)',
        category: 'Operations & Time',
        severity: 'high',
        prevalencePercentage: 64,
        retailerQuote: '"Writing bills on paper and typing them into the software at night doubled our workload for the first week."',
        sourceContext: 'Onboarding post-mortem interviews',
        rootCause: 'Fear of sudden cut-over prompting retailers to maintain parallel manual ledgers.',
        mitigationSolution: '3-day rapid cut-over protocol with on-site shadow specialist for the first weekend go-live.',
        productFeatureKey: 'On-Demand Go-Live Shadow Specialist'
      },
      {
        id: 'pp-ob-2',
        stageId: 'onboarding',
        title: 'Thermal Printer Driver Mismatch & Bluetooth Disconnects',
        category: 'Tech & Usability',
        severity: 'medium',
        prevalencePercentage: 58,
        retailerQuote: '"Our printer worked fine in the morning, but after Android phone restarted, the ESC/POS printer refused to pair."',
        sourceContext: 'Inbound support ticket logs during week 1 of onboarding',
        rootCause: 'Inconsistent Bluetooth BLE sleep timeouts across non-certified third-party Chinese thermal printers.',
        mitigationSolution: 'Native WebBluetooth auto-reconnect engine with certified plug-and-play printer hardware kits.',
        productFeatureKey: 'Resilient Bluetooth Thermal Print Service'
      },
      {
        id: 'pp-ob-3',
        stageId: 'onboarding',
        title: 'Multi-Role Permission Confusion (Staff vs Manager PINs)',
        category: 'Trust & Compliance',
        severity: 'low',
        prevalencePercentage: 42,
        retailerQuote: '"I do not want my cashiers to see wholesale purchase margins, but they need to give ₹5 festival discounts."',
        sourceContext: 'Security configuration interviews',
        rootCause: 'Rigid all-or-nothing admin privileges in traditional retail software.',
        mitigationSolution: 'Granular Role-Based Access Control (RBAC) with supervisor PIN override for refunds & discount caps.',
        productFeatureKey: 'Staff RBAC & Supervisor PIN Overrides'
      }
    ],
    milestoneChecklist: [
      { id: 'ms-ob-1', label: 'Complete Store KYC & GSTIN Profile', description: 'Store address, legal name, GST number verified', isRequired: true },
      { id: 'ms-ob-2', label: '100% Core Catalog Ingested & Barcoded', description: 'All in-store products entered with MRP & selling prices', isRequired: true },
      { id: 'ms-ob-3', label: 'Wholesale Supplier Network Connected', description: 'Linked to at least 1 verified wholesale distributor', isRequired: false },
      { id: 'ms-ob-4', label: 'Cashier Staff Completed Training Simulation', description: 'All active shift employees trained and assigned PINs', isRequired: true },
      { id: 'ms-ob-5', label: 'Dry-Run End-of-Day Cash Balancing Passed', description: 'Mock day-close report matched physical cash drawer', isRequired: true }
    ],
    kpiMetrics: [
      { label: 'Avg. Days to Full Go-Live', value: '5.8 days', benchmark: '< 7 days target' },
      { label: 'Staff Training Pass Rate', value: '94.2%', benchmark: '> 90% target' },
      { label: 'First Bill Print Time', value: '2.1 sec', benchmark: '< 3 sec target' }
    ]
  },
  {
    id: 'adoption',
    label: 'Adoption & Daily Usage',
    stepNumber: 4,
    timeframe: 'Day 22 - 60',
    mindset: 'We are completely live! Billing lines move twice as fast, stock-outs are flagged automatically, and day-end cash balancing takes 5 minutes.',
    primaryGoal: '100% live customer transactions processed through Ellic; daily cash register reconciliation; automated wholesale replenishment.',
    sentimentScore: 4, // High Confidence
    sentimentLabel: 'High Confidence & Operational Mastery',
    sentimentTrend: 'peak',
    dropoffRate: 9,
    avgDaysInStage: 28,
    touchpoints: [
      {
        id: 'tp-ad-1',
        title: 'First 250 Live Bills Milestone Badge & Celebration Call',
        channel: 'WhatsApp',
        actor: 'Customer Success Team',
        description: 'Automated achievement notification celebrating first 250 successful customer receipts with operational stats.',
        deliverable: 'Milestone digital certificate & customized promotional coupon pack',
        effectivenessScore: 4.8
      },
      {
        id: 'tp-ad-2',
        title: 'Day-7 Operational Health Check Call',
        channel: 'Phone / Video',
        actor: 'Dedicated Account Manager',
        description: 'Review of weekly sales trends, high-margin inventory velocity, and any staff difficulties.',
        deliverable: 'Weekly Performance Audit & Restock recommendations',
        effectivenessScore: 4.7,
        isCriticalMilestone: true
      },
      {
        id: 'tp-ad-3',
        title: 'Automated 1-Click Wholesaler PO Dispatch',
        channel: 'Android App',
        actor: 'Store Owner / Inventory Staff',
        description: 'Low-stock items below threshold automatically bundled into a purchase order sent directly to wholesaler portal.',
        deliverable: 'Digital Purchase Order with instant wholesaler acknowledgement',
        effectivenessScore: 4.9,
        isCriticalMilestone: true
      },
      {
        id: 'tp-ad-4',
        title: 'Automated Nightly WhatsApp Business Summary',
        channel: 'WhatsApp',
        actor: 'Ellic System Bot',
        description: 'Pushed at 10:30 PM to store owner: Total Sales, Cash in Drawer, UPI receipts, Top 5 fast-movers, Low stock warnings.',
        deliverable: 'Executive daily summary PDF & WhatsApp message',
        effectivenessScore: 4.9
      }
    ],
    painPoints: [
      {
        id: 'pp-ad-1',
        stageId: 'adoption',
        title: 'Cash Drawer vs. QR UPI Reconciliation Discrepancy at Shift Close',
        category: 'Financial & Pricing',
        severity: 'high',
        prevalencePercentage: 67,
        retailerQuote: '"At 10:30 PM closing, drawer was short ₹850 because a cashier thought a pending QR payment had settled when the customer walked out."',
        sourceContext: 'End-of-day cash audit interviews with store cashiers',
        rootCause: 'Asynchronous bank UPI payment delays leading cashiers to mark orders as paid before confirmation.',
        mitigationSolution: 'Instant sound-box audio confirmation + integrated dynamic QR code with real-time settlement lock.',
        productFeatureKey: 'Dynamic QR Payment Lock & Audio Confirmation'
      },
      {
        id: 'pp-ad-2',
        stageId: 'adoption',
        title: 'Wholesaler Stock-out Delays & Fulfillment Latency',
        category: 'Operations & Time',
        severity: 'medium',
        prevalencePercentage: 52,
        retailerQuote: '"We sent an emergency restock order for basmati rice, but the distributor took 36 hours to confirm dispatch."',
        sourceContext: 'Supply chain friction research with FMCG retailers',
        rootCause: 'Wholesaler order backlog and manual phone verification.',
        mitigationSolution: 'Automated Restock SLA tracking with multi-supplier failover routing.',
        productFeatureKey: 'Wholesaler Restock SLA Engine'
      },
      {
        id: 'pp-ad-3',
        stageId: 'adoption',
        title: 'Customer Hesitation to Share Phone Numbers for Digital Bills',
        category: 'Trust & Compliance',
        severity: 'low',
        prevalencePercentage: 44,
        retailerQuote: '"Some walk-in customers buying ₹30 snacks refuse to give their mobile number because they fear spam calls."',
        sourceContext: 'Consumer privacy sentiment study in urban counters',
        rootCause: 'Customer fatigue from aggressive marketing SMS from other big retail chains.',
        mitigationSolution: '1-click anonymous quick-checkout with optional physical paper thermal bill or scan-to-save QR on counter display.',
        productFeatureKey: 'Anonymous Fast Checkout & Counter QR'
      }
    ],
    milestoneChecklist: [
      { id: 'ms-ad-1', label: 'First 100 Live Retail Transactions Completed', description: 'Processed real customers through counter POS', isRequired: true },
      { id: 'ms-ad-2', label: 'Zero-Discrepancy Day-Close Reconciliation', description: 'Cash drawer matched register 3 days in a row', isRequired: true },
      { id: 'ms-ad-3', label: 'First Restock Order Placed to Wholesaler via App', description: 'Digital PO generated and accepted by distributor', isRequired: true },
      { id: 'ms-ad-4', label: 'Monthly GST Tax Report Exported to CA', description: 'GSTR-1 summary downloaded or emailed to accountant', isRequired: false }
    ],
    kpiMetrics: [
      { label: '30-Day Retention Rate', value: '91.6%', benchmark: 'Industry avg: 72%' },
      { label: 'Avg. Daily Bills Processed', value: '184 bills', benchmark: '> 120 target' },
      { label: 'Counter Billing Speed', value: '18.2 sec / bill', benchmark: '55% faster than manual' }
    ]
  },
  {
    id: 'advocacy',
    label: 'Advocacy & Expansion',
    stepNumber: 5,
    timeframe: 'Day 61+',
    mindset: 'Ellic has transformed our retail margins and inventory turnover. We are opening a 2nd outlet and referring our wholesale merchant circle.',
    primaryGoal: 'Multi-outlet expansion; wholesale trade credit line access; referral rewards; advanced margin analytics.',
    sentimentScore: 5, // Champion / Maximum Delight
    sentimentLabel: 'Brand Champion & Expanding Enterprise',
    sentimentTrend: 'peak',
    dropoffRate: 3,
    avgDaysInStage: 90,
    touchpoints: [
      {
        id: 'tp-av-1',
        title: 'Quarterly Business Review (QBR) & Profit Analytics',
        channel: 'Phone / Video',
        actor: 'Enterprise Growth Director',
        description: 'Comprehensive audit analyzing top profit margins, dead inventory reduction, and customer return rates.',
        deliverable: 'Executive Profit Maximization Strategy Report',
        effectivenessScore: 4.9
      },
      {
        id: 'tp-av-2',
        title: 'Multi-Store Branch Expansion Setup',
        channel: 'Digital / Web',
        actor: 'Retailer Owner & Onboarding Lead',
        description: 'Cloning existing catalog and tax settings to a new secondary branch outlet in minutes.',
        deliverable: 'Multi-branch centralized dashboard activation',
        effectivenessScore: 4.8,
        isCriticalMilestone: true
      },
      {
        id: 'tp-av-3',
        title: 'Merchant Ambassador Referral Program',
        channel: 'WhatsApp',
        actor: 'Retailer Owner',
        description: 'Retailer refers peer shopkeepers in trade association; earns 1 month free subscription or wholesale rebate.',
        deliverable: 'Unique referral link & partner badge',
        effectivenessScore: 4.6
      },
      {
        id: 'tp-av-4',
        title: 'Wholesale Trade Credit Line Activation',
        channel: 'Digital / Web',
        actor: 'Ellic Capital & Wholesale Partner',
        description: 'Unlocking $5,000 - $25,000 revolving 30-day inventory credit line based on verified transaction track record.',
        deliverable: 'Pre-approved wholesale credit facility',
        effectivenessScore: 4.9,
        isCriticalMilestone: true
      }
    ],
    painPoints: [
      {
        id: 'pp-av-1',
        stageId: 'advocacy',
        title: 'Inter-Branch Stock Transfer Reconciliation Delays',
        category: 'Operations & Time',
        severity: 'medium',
        prevalencePercentage: 46,
        retailerQuote: '"Moving 50 sacks of sugar from our central warehouse to branch 2 required calling both managers to avoid double-entry errors."',
        sourceContext: 'Interviews with expanding 2-5 store operators',
        rootCause: 'Lack of automated dispatch-in-transit states between retail branch outlets.',
        mitigationSolution: '1-click digital Stock Transfer Notes with barcode dispatch & receiving confirmation scan.',
        productFeatureKey: 'Inter-Branch Stock Transfer Engine'
      },
      {
        id: 'pp-av-2',
        stageId: 'advocacy',
        title: 'Seasonal Part-Time Staff Retraining Overhead',
        category: 'Operations & Time',
        severity: 'low',
        prevalencePercentage: 41,
        retailerQuote: '"During festival seasons we hire college students for 2 months. I cannot spend 3 days training them every time."',
        sourceContext: 'Festival rush operational feedback',
        rootCause: 'High turnover of casual retail employees.',
        mitigationSolution: '3-minute gamified in-app cashier simulator that trains new workers on mock bills in their regional language.',
        productFeatureKey: '3-Minute In-App Cashier Training Arcade'
      }
    ],
    milestoneChecklist: [
      { id: 'ms-av-1', label: 'Active Daily Usage for 60+ Consecutive Days', description: 'Store operated seamlessly with zero rollback to paper', isRequired: true },
      { id: 'ms-av-2', label: 'Wholesale Digital Replenishment Established', description: '> 80% of restock orders routed digitally', isRequired: true },
      { id: 'ms-av-3', label: 'Referred at Least 1 Peer Retailer', description: 'Invited fellow shopkeeper to try Ellic platform', isRequired: false },
      { id: 'ms-av-4', label: 'Unlocked Multi-Store or Trade Credit Facility', description: 'Expanded scale or accessed working capital', isRequired: false }
    ],
    kpiMetrics: [
      { label: 'Net Promoter Score (NPS)', value: '+74', benchmark: 'Top decile B2B SaaS' },
      { label: 'Referral Pipeline Contribution', value: '38.4%', benchmark: 'Viral organic growth' },
      { label: 'Inventory Turnover Improvement', value: '+31%', benchmark: 'Faster stock velocity' }
    ]
  }
];

export const initialTrackedRetailers: RetailerOnboardingProfile[] = [
  {
    id: 'ret-101',
    storeName: 'Apex Super Bazaar & Grocery',
    ownerName: 'Rajesh Verma',
    phone: '+91 98201 44512',
    email: 'apex.bazaar@gmail.com',
    city: 'Mumbai',
    segment: 'supermarket',
    skuCountApprox: 2400,
    currentStage: 'evaluation',
    stageProgress: 65,
    daysInCurrentStage: 4,
    status: 'at_risk',
    onboardingManager: 'Priya Sen (Tech Lead)',
    targetGoLiveDate: '2026-09-18',
    joinedDate: '2026-08-28',
    completedMilestones: ['ms-aw-1', 'ms-aw-2', 'ms-aw-3', 'ms-ev-1'],
    activePainPointIds: ['pp-ev-1'], // Messy Excel catalog
    mitigatedPainPointIds: ['pp-aw-1'],
    notes: 'Large catalog with 2,400 SKUs. Owner hesitant because their old Excel ledger has missing barcode numbers. Sent OCR team to assist.',
    touchpointHistory: [
      {
        id: 'th-1',
        date: '2026-08-28',
        touchpointTitle: 'Wholesale Distributor Referral',
        channel: 'Peer Network',
        performedBy: 'Ramesh Wholesale Agency',
        notes: 'Owner interested in automatic purchase order generation.'
      },
      {
        id: 'th-2',
        date: '2026-08-30',
        touchpointTitle: 'Field Agent Counter Demo',
        channel: 'Field Visit',
        performedBy: 'Priya Sen',
        notes: 'Demonstrated barcode scanning on mobile phone. Owner was amazed by the speed.'
      },
      {
        id: 'th-3',
        date: '2026-09-02',
        touchpointTitle: 'Interactive 15-Minute Sandbox Trial',
        channel: 'Android App',
        performedBy: 'Self-Serve',
        notes: 'Created 14 mock bills. Tested receipt printing on existing Epson Bluetooth printer.'
      }
    ]
  },
  {
    id: 'ret-102',
    storeName: 'Krishna Provisions & Dry Fruits',
    ownerName: 'Ghanshyam Patel',
    phone: '+91 98450 11234',
    email: 'krishna.dryfruits@outlook.com',
    city: 'Ahmedabad',
    segment: 'kirana',
    skuCountApprox: 850,
    currentStage: 'awareness',
    stageProgress: 30,
    daysInCurrentStage: 2,
    status: 'on_track',
    onboardingManager: 'Rohan Varma',
    targetGoLiveDate: '2026-09-25',
    joinedDate: '2026-09-01',
    completedMilestones: ['ms-aw-1'],
    activePainPointIds: ['pp-aw-2', 'pp-aw-3'],
    mitigatedPainPointIds: [],
    notes: 'Traditional merchant. Concerned about hardware costs and monthly subscriptions. Scheduled demonstration for Friday.',
    touchpointHistory: [
      {
        id: 'th-4',
        date: '2026-09-01',
        touchpointTitle: 'Field Agent Counter Demo',
        channel: 'Field Visit',
        performedBy: 'Rohan Varma',
        notes: 'Showed mobile-camera billing. Addressed concern about needing a PC.'
      }
    ]
  },
  {
    id: 'ret-103',
    storeName: 'Metro Pharma & Wellness Care',
    ownerName: 'Dr. Sunita Kulkarni',
    phone: '+91 97662 88901',
    email: 'metropharma.mgmt@gmail.com',
    city: 'Pune',
    segment: 'pharmacy',
    skuCountApprox: 3800,
    currentStage: 'onboarding',
    stageProgress: 80,
    daysInCurrentStage: 5,
    status: 'on_track',
    onboardingManager: 'Ananya Roy',
    targetGoLiveDate: '2026-09-10',
    joinedDate: '2026-08-20',
    completedMilestones: ['ms-aw-1', 'ms-aw-2', 'ms-aw-3', 'ms-ev-1', 'ms-ev-2', 'ms-ev-3', 'ms-ob-1', 'ms-ob-2', 'ms-ob-3'],
    activePainPointIds: ['pp-ob-1'],
    mitigatedPainPointIds: ['pp-ev-1', 'pp-ev-3'],
    notes: 'Pharmacy drug batch number and expiry tracking configured. 2 counter cashiers undergoing final fast-billing test.',
    touchpointHistory: [
      {
        id: 'th-5',
        date: '2026-08-20',
        touchpointTitle: 'Web & Android Play Store Exploration',
        channel: 'Android App',
        performedBy: 'Self-Serve',
        notes: 'Downloaded app and verified HSN tax rate accuracy.'
      },
      {
        id: 'th-6',
        date: '2026-08-24',
        touchpointTitle: '1-on-1 Specialist Video Consultation',
        channel: 'Phone / Video',
        performedBy: 'Ananya Roy',
        notes: 'Configured scheduled medicine batch tracking & expiry alerts.'
      },
      {
        id: 'th-7',
        date: '2026-09-01',
        touchpointTitle: 'Automated Wholesaler Catalog Link-up',
        channel: 'Digital / Web',
        performedBy: 'System',
        notes: 'Synced 3,200 generic and branded pharmaceutical SKUs with max MRPs.'
      }
    ]
  },
  {
    id: 'ret-104',
    storeName: 'Shreeji Fresh Mart (Multi-Counter)',
    ownerName: 'Bhavin Shah',
    phone: '+91 98902 33411',
    email: 'bhavin@shreejimart.com',
    city: 'Surat',
    segment: 'supermarket',
    skuCountApprox: 4200,
    currentStage: 'adoption',
    stageProgress: 90,
    daysInCurrentStage: 18,
    status: 'completed',
    onboardingManager: 'Vikram Malhotra',
    targetGoLiveDate: '2026-08-15',
    joinedDate: '2026-07-25',
    completedMilestones: [
      'ms-aw-1', 'ms-aw-2', 'ms-aw-3',
      'ms-ev-1', 'ms-ev-2', 'ms-ev-3',
      'ms-ob-1', 'ms-ob-2', 'ms-ob-3', 'ms-ob-4', 'ms-ob-5',
      'ms-ad-1', 'ms-ad-2', 'ms-ad-3'
    ],
    activePainPointIds: [],
    mitigatedPainPointIds: ['pp-ad-1', 'pp-ob-1', 'pp-ev-3'],
    notes: 'Flagship adopter. Successfully processed over 1,400 bills. Sound-box QR payment installed. Ready for Multi-Store branch expansion.',
    touchpointHistory: [
      {
        id: 'th-8',
        date: '2026-07-28',
        touchpointTitle: 'Field Agent Counter Demo',
        channel: 'Field Visit',
        performedBy: 'Vikram Malhotra',
        notes: 'Initial evaluation completed.'
      },
      {
        id: 'th-9',
        date: '2026-08-15',
        touchpointTitle: '20-Minute Staff Training',
        channel: 'Field Visit',
        performedBy: 'Vikram Malhotra',
        notes: 'Trained 4 cashiers on morning and evening shifts.'
      },
      {
        id: 'th-10',
        date: '2026-08-25',
        touchpointTitle: 'First 250 Live Bills Celebration Call',
        channel: 'WhatsApp',
        performedBy: 'System',
        notes: 'Celebrated 250 bills with zero cash register discrepancy.'
      }
    ]
  },
  {
    id: 'ret-105',
    storeName: 'QuickStop Convenience 24/7',
    ownerName: 'Farhan Shaikh',
    phone: '+91 98119 55678',
    email: 'quickstop247@gmail.com',
    city: 'Mumbai',
    segment: 'general_trade',
    skuCountApprox: 1100,
    currentStage: 'evaluation',
    stageProgress: 45,
    daysInCurrentStage: 8,
    status: 'blocked',
    onboardingManager: 'Priya Sen (Tech Lead)',
    targetGoLiveDate: '2026-09-15',
    joinedDate: '2026-08-25',
    completedMilestones: ['ms-aw-1', 'ms-aw-2', 'ms-ev-1'],
    activePainPointIds: ['pp-ev-3'], // Internet drops
    mitigatedPainPointIds: [],
    notes: 'Blocked due to local basement store having poor cellular data signal. Technician visiting to demonstrate Offline-First PWA caching mode.',
    touchpointHistory: [
      {
        id: 'th-11',
        date: '2026-08-26',
        touchpointTitle: 'Field Agent Counter Demo',
        channel: 'Field Visit',
        performedBy: 'Priya Sen',
        notes: 'Counter space is compact. Recommended mobile phone setup.'
      },
      {
        id: 'th-12',
        date: '2026-09-02',
        touchpointTitle: '1-on-1 Specialist Consultation',
        channel: 'Phone / Video',
        performedBy: 'Priya Sen',
        notes: 'Discussed basement network drops. Scheduled offline mode live test.'
      }
    ]
  },
  {
    id: 'ret-106',
    storeName: 'Zenith Electronics & FMCG Appliances',
    ownerName: 'Manish Chawla',
    phone: '+91 98334 77890',
    email: 'zenith.electronics@chawla.com',
    city: 'Delhi NCR',
    segment: 'electronics',
    skuCountApprox: 1500,
    currentStage: 'awareness',
    stageProgress: 20,
    daysInCurrentStage: 3,
    status: 'on_track',
    onboardingManager: 'Rohan Varma',
    targetGoLiveDate: '2026-09-30',
    joinedDate: '2026-08-31',
    completedMilestones: ['ms-aw-1'],
    activePainPointIds: ['pp-aw-1'],
    mitigatedPainPointIds: [],
    notes: 'High-value electronics requiring serial number tracking and warranty invoice templates. Reviewed custom invoice template builder.',
    touchpointHistory: [
      {
        id: 'th-13',
        date: '2026-08-31',
        touchpointTitle: 'Wholesale Distributor Referral',
        channel: 'Peer Network',
        performedBy: 'National Electro Wholesalers',
        notes: 'Referred by distributor for warranty and invoice management.'
      }
    ]
  },
  {
    id: 'ret-107',
    storeName: 'Heritage Spices & Traditional Kirana',
    ownerName: 'Narayan Rao',
    phone: '+91 94480 66789',
    email: 'heritage.spices@yahoo.co.in',
    city: 'Bengaluru',
    segment: 'kirana',
    skuCountApprox: 950,
    currentStage: 'onboarding',
    stageProgress: 55,
    daysInCurrentStage: 6,
    status: 'on_track',
    onboardingManager: 'Ananya Roy',
    targetGoLiveDate: '2026-09-12',
    joinedDate: '2026-08-23',
    completedMilestones: ['ms-aw-1', 'ms-aw-2', 'ms-aw-3', 'ms-ev-1', 'ms-ev-2', 'ms-ob-1'],
    activePainPointIds: ['pp-ob-2'], // Thermal printer pairing
    mitigatedPainPointIds: ['pp-ev-2'],
    notes: 'Staff training in Kannada underway. Tested loose weight calculation keys. Received Bluetooth printer yesterday.',
    touchpointHistory: [
      {
        id: 'th-14',
        date: '2026-08-23',
        touchpointTitle: 'Regional Merchant Association Community',
        channel: 'WhatsApp',
        performedBy: 'Bangalore Retail Union',
        notes: 'Joined pilot cohort.'
      },
      {
        id: 'th-15',
        date: '2026-08-29',
        touchpointTitle: '1-on-1 Specialist Consultation',
        channel: 'Phone / Video',
        performedBy: 'Ananya Roy',
        notes: 'Helped map regional spice names to standard HSN codes.'
      }
    ]
  },
  {
    id: 'ret-108',
    storeName: 'City Fresh Organic Grocers',
    ownerName: 'Anita Deshmukh',
    phone: '+91 98210 99823',
    email: 'anita@cityfreshgrocers.in',
    city: 'Pune',
    segment: 'supermarket',
    skuCountApprox: 2100,
    currentStage: 'advocacy',
    stageProgress: 100,
    daysInCurrentStage: 45,
    status: 'completed',
    onboardingManager: 'Vikram Malhotra',
    targetGoLiveDate: '2026-07-10',
    joinedDate: '2026-06-15',
    completedMilestones: [
      'ms-aw-1', 'ms-aw-2', 'ms-aw-3',
      'ms-ev-1', 'ms-ev-2', 'ms-ev-3',
      'ms-ob-1', 'ms-ob-2', 'ms-ob-3', 'ms-ob-4', 'ms-ob-5',
      'ms-ad-1', 'ms-ad-2', 'ms-ad-3',
      'ms-av-1', 'ms-av-2', 'ms-av-3'
    ],
    activePainPointIds: [],
    mitigatedPainPointIds: ['pp-aw-1', 'pp-ev-1', 'pp-ad-1'],
    notes: 'Power user. Has referred 4 other organic stores. Opening branch in Kothrud next month.',
    touchpointHistory: [
      {
        id: 'th-16',
        date: '2026-06-15',
        touchpointTitle: 'Field Agent Counter Demo',
        channel: 'Field Visit',
        performedBy: 'Vikram Malhotra',
        notes: 'Full onboarded champion.'
      },
      {
        id: 'th-17',
        date: '2026-08-10',
        touchpointTitle: 'Quarterly Business Review (QBR)',
        channel: 'Phone / Video',
        performedBy: 'Vikram Malhotra',
        notes: 'Verified 28% increase in checkout speed.'
      }
    ]
  }
];

export const researchStatsSummary = {
  totalRetailersSurveyed: 340,
  inDepthFieldInterviews: 85,
  averageOnboardingDays: 5.8,
  overallSatisfactionScore: 4.7, // out of 5
  keyFrictionCategories: [
    { category: 'Data & Inventory Ingestion', frictionScore: 88, resolvedByProduct: 'AI Master Catalog & OCR' },
    { category: 'Internet & Connectivity Fears', frictionScore: 85, resolvedByProduct: 'Full Offline-First Cache' },
    { category: 'Counter Disruption Anxiety', frictionScore: 82, resolvedByProduct: '3-Day Rapid Cut-over' },
    { category: 'Staff Digital Literacy', frictionScore: 79, resolvedByProduct: 'Vernacular Big-Button POS' },
    { category: 'Hidden SaaS Fee Skepticism', frictionScore: 74, resolvedByProduct: 'Forever-Free Core Tier' },
    { category: 'Payment Reconciliation Errors', frictionScore: 67, resolvedByProduct: 'Sound-Box QR Lock' }
  ]
};
