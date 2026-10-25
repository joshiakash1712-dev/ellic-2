export type JourneyStageId = 'awareness' | 'evaluation' | 'onboarding' | 'adoption' | 'advocacy';

export type PainPointSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RetailerSegment = 'kirana' | 'supermarket' | 'pharmacy' | 'electronics' | 'general_trade';

export type OnboardingStatus = 'on_track' | 'at_risk' | 'blocked' | 'completed';

export interface JourneyTouchpoint {
  id: string;
  title: string;
  channel: 'Field Visit' | 'WhatsApp' | 'Digital / Web' | 'Android App' | 'Phone / Video' | 'Hardware Box' | 'Peer Network';
  actor: string;
  description: string;
  deliverable: string;
  effectivenessScore: number; // 1 to 5
  isCriticalMilestone?: boolean;
}

export interface JourneyPainPoint {
  id: string;
  stageId: JourneyStageId;
  title: string;
  category: 'Tech & Usability' | 'Operations & Time' | 'Financial & Pricing' | 'Data & Inventory' | 'Trust & Compliance';
  severity: PainPointSeverity;
  prevalencePercentage: number; // e.g. 82%
  retailerQuote: string;
  sourceContext: string;
  rootCause: string;
  mitigationSolution: string;
  productFeatureKey?: string;
}

export interface JourneyStage {
  id: JourneyStageId;
  label: string;
  stepNumber: number;
  timeframe: string;
  mindset: string;
  primaryGoal: string;
  sentimentScore: number; // -5 to +5
  sentimentLabel: string;
  sentimentTrend: 'rising' | 'neutral' | 'dip' | 'peak';
  dropoffRate: number; // e.g. 24%
  avgDaysInStage: number;
  touchpoints: JourneyTouchpoint[];
  painPoints: JourneyPainPoint[];
  milestoneChecklist: {
    id: string;
    label: string;
    description: string;
    isRequired: boolean;
  }[];
  kpiMetrics: {
    label: string;
    value: string;
    benchmark: string;
  }[];
}

export interface RetailerOnboardingProfile {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  segment: RetailerSegment;
  skuCountApprox: number;
  currentStage: JourneyStageId;
  stageProgress: number; // 0 - 100%
  daysInCurrentStage: number;
  status: OnboardingStatus;
  onboardingManager: string;
  targetGoLiveDate: string;
  joinedDate: string;
  completedMilestones: string[]; // milestone checklist IDs
  activePainPointIds: string[]; // logged pain point IDs
  mitigatedPainPointIds: string[];
  touchpointHistory: {
    id: string;
    date: string;
    touchpointTitle: string;
    channel: string;
    notes: string;
    performedBy: string;
  }[];
  notes: string;
}
