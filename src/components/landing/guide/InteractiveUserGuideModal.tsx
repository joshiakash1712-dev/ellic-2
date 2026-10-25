import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  List,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  GUIDE_CHAPTERS,
  WORKFLOW_SEVEN_NODES,
  saveGuideStep,
  markGuideCompleted,
  markGuideDismissed,
  resetGuideProgress,
} from './guideData';
import {
  Step01MeetDemo,
  Step02SetupDemo,
  Step03ProductsInventoryDemo,
  Step04CreateBillDemo,
  Step05PaymentsDemo,
  Step06CustomersKhataDemo,
} from './GuideStepDemosPart1';
import {
  Step07StockRestockDemo,
  Step08TeamRolesDemo,
  Step09InsightsDemo,
  Step10ConnectedWorkflowDemo,
  Step11SecurityPrivacyDemo,
  Step12SubscriptionLifecycleDemo,
} from './GuideStepDemosPart2';
import { LegalPageSlug } from '../../../config/legal.config';

export interface InteractiveUserGuideModalProps {
  isOpen: boolean;
  initialStep?: number; // 0 = Intro, 1..12 = Steps, 13 = Completed
  onClose: () => void;
  onOpenGetStarted?: () => void;
  onOpenSignIn?: () => void;
  onOpenContact?: () => void;
  onNavigateToSection?: (href: string) => void;
  onOpenLegalPage?: (slug: LegalPageSlug) => void;
  onLaunchDemo?: () => void;
  onProgressChange?: (step: number, completed: boolean) => void;
}

export type GuideModalProps = InteractiveUserGuideModalProps;

export const InteractiveUserGuideModal: React.FC<InteractiveUserGuideModalProps> = ({
  isOpen,
  initialStep = 0,
  onClose,
  onOpenGetStarted,
  onOpenSignIn,
  onOpenContact,
  onNavigateToSection,
  onOpenLegalPage,
  onLaunchDemo,
  onProgressChange,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isGuideMapOpen, setIsGuideMapOpen] = useState<boolean>(false);
  const [introRippleNode, setIntroRippleNode] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      setIsGuideMapOpen(false);
    }
  }, [isOpen, initialStep]);

  // Subtle sapphire data ripple on Intro screen (Section 5)
  useEffect(() => {
    if (!isOpen || currentStep !== 0 || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setIntroRippleNode((prev) => (prev + 1) % WORKFLOW_SEVEN_NODES.length);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [isOpen, currentStep, prefersReducedMotion]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && !isGuideMapOpen) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && !isGuideMapOpen) {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const updateStep = (nextStep: number) => {
    setCurrentStep(nextStep);
    setIsGuideMapOpen(false);
    if (nextStep === 13) {
      markGuideCompleted();
      onProgressChange?.(13, true);
    } else {
      saveGuideStep(nextStep);
      onProgressChange?.(nextStep, false);
    }
  };

  const handleNext = () => {
    if (currentStep < 13) {
      updateStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      updateStep(currentStep - 1);
    }
  };

  const handleSkipGuide = () => {
    markGuideDismissed();
    onClose();
  };

  const handleRestartGuide = () => {
    resetGuideProgress();
    setCurrentStep(1);
    setIsGuideMapOpen(false);
    onProgressChange?.(1, false);
  };

  const handleExploreWebsiteSection = (href: string) => {
    onClose();
    if (onNavigateToSection) {
      onNavigateToSection(href);
      return;
    }
    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleOpenLegalFromGuide = (slug: LegalPageSlug) => {
    onClose();
    onOpenLegalPage?.(slug);
  };

  const activeChapter =
    currentStep >= 1 && currentStep <= 12 ? GUIDE_CHAPTERS[currentStep - 1] : null;

  const renderStepInteractiveDemo = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return <Step01MeetDemo />;
      case 2:
        return <Step02SetupDemo />;
      case 3:
        return <Step03ProductsInventoryDemo />;
      case 4:
        return <Step04CreateBillDemo />;
      case 5:
        return <Step05PaymentsDemo />;
      case 6:
        return <Step06CustomersKhataDemo />;
      case 7:
        return <Step07StockRestockDemo />;
      case 8:
        return <Step08TeamRolesDemo />;
      case 9:
        return <Step09InsightsDemo />;
      case 10:
        return <Step10ConnectedWorkflowDemo />;
      case 11:
        return (
          <div className="space-y-4">
            <Step12SubscriptionLifecycleDemo onOpenLegalPage={handleOpenLegalFromGuide} />
            <Step11SecurityPrivacyDemo onOpenLegalPage={handleOpenLegalFromGuide} />
          </div>
        );
      case 12:
        return (
          <div className="rounded-2xl bg-[#121826] border border-sky-500/35 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">
                  Choose Your Next Step with Ellic
                </span>
              </div>
              <span className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/25">
                STEP 12 OF 12 · ACTION HUB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  markGuideCompleted();
                  onClose();
                  onOpenGetStarted?.();
                }}
                className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-left transition-all cursor-pointer shadow-md shadow-blue-600/20 flex flex-col justify-between gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-100 font-bold">
                  Primary Action
                </div>
                <div className="text-sm font-extrabold flex items-center justify-between">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-sky-50">
                  Apply for your Ellic business workspace and start setting up your store.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExploreWebsiteSection('#product')}
                className="p-3.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Interactive Demo
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Explore Product Preview</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Test live Dashboard, POS Billing, Inventory, Customers, and Reports previews.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExploreWebsiteSection('#features')}
                className="p-3.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Capabilities
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>View Features</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspect all core modules across billing, stock, Khata, and business insights.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContact?.();
                }}
                className="p-3.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Questions & Onboarding
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Contact Ellic</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Reach out to our team for store onboarding assistance or questions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenSignIn) {
                    onOpenSignIn();
                  } else if (onLaunchDemo) {
                    onLaunchDemo();
                  }
                }}
                className="p-3.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Existing Account
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Already have an Ellic account? Sign in to your business console.
                </p>
              </button>

              <button
                type="button"
                onClick={handleRestartGuide}
                className="p-3.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Review Again
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Restart Guide</span>
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Start the 12-step interactive walkthrough again from Step 01.
                </p>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const completionTopics = [
    'Products',
    'Billing',
    'Inventory',
    'Payments',
    'Customers',
    'Khata',
    'Crew',
    'Roles',
    'Insights',
    'Connected workflow',
    'Security & privacy',
    'Subscription lifecycle',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Ellic Interactive User Guide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-1.5 sm:p-4 md:p-6 bg-[#0A0E1A]/85 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl rounded-2xl bg-[#0A0E1A] border border-slate-800 shadow-[0_24px_60px_rgba(0,0,0,0.65)] text-white flex flex-col max-h-[95dvh] sm:max-h-[92vh] overflow-hidden"
          >
            {/* ============================================================== */}
            {/* TOP GUIDE HEADER & PROGRESS BAR (SECTION 22, 23, 26)           */}
            {/* ============================================================== */}
            <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#121826] border-b border-slate-800 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                {/* Brand & Step Counter */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-sky-500/15 border border-sky-500/35 text-sky-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shrink-0">
                    <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
                    <span className="hidden xs:inline">ELLIC </span>
                    <span>GUIDE</span>
                  </span>

                  <span className="text-xs sm:text-sm font-extrabold text-white tabular-nums truncate">
                    {currentStep === 0
                      ? 'Intro & Overview'
                      : currentStep === 13
                      ? '12 / 12 · ✓ COMPLETED'
                      : `Step ${String(currentStep).padStart(2, '0')} of 12`}
                  </span>
                </div>

                {/* Right Header Controls: Guide Map Toggle + Close */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGuideMapOpen((v) => !v)}
                    aria-expanded={isGuideMapOpen}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isGuideMapOpen
                        ? 'bg-blue-600 border-sky-500 text-white'
                        : 'bg-[#161D2C] hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <List className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="hidden xs:inline">{isGuideMapOpen ? 'Hide Map' : 'All Steps'}</span>
                    <span className="xs:hidden">Steps</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close guide"
                    className="p-1.5 rounded-lg bg-[#161D2C] hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Connected 12-Dot Progress Track + Linear Fill Bar: ●━━●━━●━━○━━○... */}
              <div className="space-y-1.5 pt-0.5">
                <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: `${Math.min(100, Math.max(0, (Math.min(12, currentStep) / 12) * 100))}%`,
                    }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-sky-200 rounded-full"
                  />
                </div>

                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={12}
                  aria-valuenow={Math.min(12, currentStep)}
                  className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar"
                >
                  {GUIDE_CHAPTERS.map((ch) => {
                    const isCompleted = currentStep > ch.stepNumber || currentStep === 13;
                    const isCurrent = currentStep === ch.stepNumber;
                    return (
                      <React.Fragment key={ch.stepNumber}>
                        <button
                          type="button"
                          onClick={() => updateStep(ch.stepNumber)}
                          title={`Step ${ch.code}: ${ch.shortTitle}`}
                          className={`group flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-all cursor-pointer shrink-0 ${
                            isCurrent
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'hover:bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              isCurrent
                                ? 'bg-sky-400 ring-4 ring-blue-500/25 scale-110'
                                : isCompleted
                                ? 'bg-sky-500'
                                : 'bg-slate-700 group-hover:bg-slate-500'
                            }`}
                          />
                          <span className="text-[10px] font-mono font-bold hidden lg:inline">
                            {ch.code}
                          </span>
                        </button>
                        {ch.stepNumber < 12 && (
                          <div
                            className={`h-0.5 flex-1 min-w-[8px] rounded-full transition-colors ${
                              currentStep > ch.stepNumber ? 'bg-sky-500/70' : 'bg-slate-800'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* "YOU ARE HERE" Breadcrumb Context (Section 26) */}
              <div
                aria-label="You Are Here Guide Breadcrumb"
                className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-slate-400 font-medium">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono font-extrabold text-sky-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span>YOU ARE HERE</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => updateStep(0)}
                    className="text-slate-300 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
                  >
                    Guide
                  </button>

                  {activeChapter ? (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <button
                        type="button"
                        onClick={() => setIsGuideMapOpen(true)}
                        className="text-slate-200 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
                      >
                        {activeChapter.breadcrumbCategory}
                      </button>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-sky-300 font-bold">
                        {activeChapter.breadcrumbTopic}
                      </span>
                    </>
                  ) : currentStep === 0 ? (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-sky-300 font-bold">
                        Welcome &amp; Connected Journey Overview
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-sky-300 font-bold">
                        Guide Completed (12 / 12)
                      </span>
                    </>
                  )}
                </div>

                <span className="hidden sm:inline text-[10px] font-mono text-slate-400">
                  Use ← / → keys or buttons below to navigate
                </span>
              </div>
            </div>

            {/* ============================================================== */}
            {/* EXPANDABLE GUIDE MAP / TABLE OF CONTENTS (SECTION 23)          */}
            {/* ============================================================== */}
            <AnimatePresence>
              {isGuideMapOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#161D2C] border-b border-slate-800 px-4 sm:px-6 py-4 overflow-y-auto max-h-72 shrink-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Compass className="w-4 h-4 text-sky-400" />
                      <span>Guide Map: Jump to Any Chapter (12 Steps)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateStep(0)}
                      className="text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
                    >
                      00 · View Introduction & Journey Map
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {GUIDE_CHAPTERS.map((ch) => {
                      const isCurrent = currentStep === ch.stepNumber;
                      const isDone = currentStep > ch.stepNumber || currentStep === 13;
                      return (
                        <button
                          key={ch.stepNumber}
                          type="button"
                          onClick={() => updateStep(ch.stepNumber)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isCurrent
                              ? 'bg-sky-500/20 border-sky-500 text-white'
                              : isDone
                              ? 'bg-[#121826] border-sky-500/30 text-slate-200 hover:border-blue-500/60'
                              : 'bg-[#121826] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono text-sky-400 font-bold">
                              STEP {ch.code}
                            </div>
                            <div className="text-xs font-bold truncate">{ch.shortTitle}</div>
                          </div>
                          {isDone && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ============================================================== */}
            {/* MAIN SCROLLABLE GUIDE BODY                                     */}
            {/* ============================================================== */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              <AnimatePresence mode="wait">
                {/* ---------------------------------------------------------- */}
                {/* SCREEN 0: GUIDE INTRODUCTION & COMPLETE JOURNEY (SEC 4 & 5)*/}
                {/* ---------------------------------------------------------- */}
                {currentStep === 0 && (
                  <motion.div
                    key="guide-intro"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Hero Welcome Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#121826] border border-slate-800 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>Interactive Product Walkthrough · 12 Short Chapters</span>
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          Welcome to Ellic.
                        </h2>
                        <p className="text-sm sm:text-base text-sky-400 font-semibold mt-1">
                          One connected platform for running your business.
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                        Even if you have never used POS or business-management software before, this guided tour shows how Ellic brings together your everyday operations into one connected workflow:
                      </p>

                      {/* 7 Core Pillars */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Products',
                          'Billing',
                          'Inventory',
                          'Payments',
                          'Customers',
                          'Khata',
                          'Insights',
                        ].map((pillar) => (
                          <span
                            key={pillar}
                            className="px-3 py-1.5 rounded-xl bg-[#0A0E1A] border border-sky-500/30 text-xs font-bold text-white flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            {pillar}
                          </span>
                        ))}
                      </div>

                      {/* Central Concept Visual Chain */}
                      <div className="p-4 rounded-xl bg-[#0A0E1A] border border-slate-800">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                          The Core Concept
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
                          {[
                            { step: '01', title: 'ONE BUSINESS ACTION', sub: 'Counter sale or stock entry' },
                            { step: '02', title: 'CONNECTED DATA', sub: 'Records link automatically' },
                            { step: '03', title: 'CONNECTED OPERATIONS', sub: 'Bill, Stock, Payment & Khata' },
                            { step: '04', title: 'BUSINESS INSIGHTS', sub: 'Clear operational visibility' },
                          ].map((item, idx) => (
                            <div
                              key={item.step}
                              className="p-3 rounded-xl bg-[#121826] border border-sky-500/25 relative"
                            >
                              <div className="text-[10px] font-mono font-bold text-sky-400">
                                {item.step}
                              </div>
                              <div className="text-xs font-extrabold text-white mt-0.5">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                              {idx < 3 && (
                                <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-sky-400 absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Show the Complete Journey First (01 Product -> 07 Insights) */}
                    <div className="p-5 rounded-2xl bg-[#121826] border border-slate-800 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                            The Complete Connected Journey
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            These aren&apos;t separate tools. They are connected parts of the same business workflow.
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/25">
                          Live Sapphire Data Ripple
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {WORKFLOW_SEVEN_NODES.map((node, idx) => {
                          const isActive = idx === introRippleNode;
                          return (
                            <div
                              key={node.code}
                              onClick={() => setIntroRippleNode(idx)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_18px_rgba(37, 99, 235,0.28)]'
                                  : 'bg-[#0A0E1A] border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-400">
                                <span>{node.code}</span>
                                {isActive && (
                                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                                )}
                              </div>
                              <div className="text-xs font-extrabold text-white mt-1">
                                {node.label}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{node.sub}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleSkipGuide}
                          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
                        >
                          Skip Guide
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStep(1)}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <span>Start the Journey →</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* STEPS 01 TO 12: CHAPTER VIEW (SECTIONS 7 TO 20, 33, 34)    */}
                {/* ---------------------------------------------------------- */}
                {activeChapter && (
                  <motion.div
                    key={`chapter-${activeChapter.stepNumber}`}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Chapter Header + Website Map Link (Section 27) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase">
                          <span>STEP {activeChapter.code} OF 12</span>
                          <span>·</span>
                          <span>{activeChapter.breadcrumbCategory}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                          {activeChapter.title}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleExploreWebsiteSection(activeChapter.exploreSectionHref)
                        }
                        className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-blue-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <span>{activeChapter.exploreSectionLabel}</span>
                      </button>
                    </div>

                    {/* Section 33: 4 Structured Questions (No Wall of Text) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono font-bold uppercase text-sky-400">
                          1. What is this?
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-200 mt-1 leading-relaxed">
                          {activeChapter.whatIsIt}
                        </p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono font-bold uppercase text-sky-400">
                          2. Why does it matter?
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-200 mt-1 leading-relaxed">
                          {activeChapter.whyItMatters}
                        </p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono font-bold uppercase text-sky-400">
                          3. How does it work?
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-200 mt-1 leading-relaxed">
                          {activeChapter.howItWorks}
                        </p>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono font-bold uppercase text-sky-400">
                          4. What happens next?
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-200 mt-1 leading-relaxed">
                          {activeChapter.whatHappensNext}
                        </p>
                      </div>
                    </div>

                    {/* Section 25: Contextual "Try this ->" Tooltip Cue */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 font-medium">
                      <span className="px-2 py-0.5 rounded bg-sky-500 text-slate-950 font-extrabold text-[10px] uppercase shrink-0">
                        Try this →
                      </span>
                      <span>{activeChapter.interactivePrompt}</span>
                    </div>

                    {/* Interactive Visual Demonstration for Current Step */}
                    {renderStepInteractiveDemo(activeChapter.stepNumber)}

                    {/* Section 34: KEY TAKEAWAY Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/50 via-[#121826] to-[#121826] border border-sky-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-sky-400">
                          KEY TAKEAWAY · STEP {activeChapter.code}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          “{activeChapter.keyTakeaway}”
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleExploreWebsiteSection(activeChapter.exploreSectionHref)
                        }
                        className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline shrink-0 cursor-pointer"
                      >
                        {activeChapter.exploreSectionLabel}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* SCREEN 13: FINAL GUIDE COMPLETION SCREEN (SEC 21 & 35)     */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 13 && (
                  <motion.div
                    key="guide-completed"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="p-5 sm:p-7 rounded-2xl bg-[#121826] border border-sky-500/40 space-y-6 shadow-[0_0_36px_rgba(37, 99, 235,0.14)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold">
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        <span>12 / 12 · ✓ GUIDE COMPLETED</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        Ellic Onboarding Tour
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        You&apos;re Ready to Explore Ellic.
                      </h2>
                      <p className="text-sm text-sky-400 font-semibold mt-1">
                        You now understand how Ellic connects everyday business operations.
                      </p>
                    </div>

                    {/* Subtle Sapphire Workflow Completion Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {WORKFLOW_SEVEN_NODES.map((node) => (
                        <div
                          key={node.code}
                          className="p-2.5 rounded-xl bg-[#0A0E1A] border border-sky-500/35 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-[10px] font-mono text-sky-400 font-bold">
                              {node.code}
                            </div>
                            <div className="text-xs font-bold text-white">{node.label}</div>
                          </div>
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* 12 Completed Topics Summary */}
                    <div className="p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        You now understand:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {completionTopics.map((topic) => (
                          <div
                            key={topic}
                            className="flex items-center gap-2 text-xs font-semibold text-white bg-[#121826] px-3 py-2 rounded-lg border border-slate-800"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Three Final Choices: [Explore Ellic] [Restart Guide] [Get Started] */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-5 py-2.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-bold text-white cursor-pointer transition-colors"
                        >
                          Explore Ellic
                        </button>
                        <button
                          type="button"
                          onClick={handleRestartGuide}
                          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] hover:bg-slate-800 border border-slate-800 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restart Guide</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenGetStarted?.();
                        }}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ============================================================== */}
            {/* BOTTOM NAVIGATION CONTROLS (SECTION 22)                        */}
            {/* ============================================================== */}
            <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#121826] border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#161D2C] hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>Prev</span>
                  <span className="hidden sm:inline -ml-1">ious</span>
                </button>

                {currentStep >= 1 && currentStep <= 12 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="hidden xs:inline-flex px-2.5 sm:px-3 py-2 rounded-xl bg-transparent hover:bg-slate-800/70 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    Skip Step
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleSkipGuide}
                  className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  Skip Guide
                </button>

                <button
                  type="button"
                  onClick={() => setIsGuideMapOpen((v) => !v)}
                  className="px-3 py-2 rounded-xl bg-[#161D2C] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors hidden sm:inline-flex items-center gap-1.5"
                >
                  <List className="w-3.5 h-3.5 text-sky-400" />
                  <span>View All Steps</span>
                </button>

                {currentStep < 13 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>
                      {currentStep === 0
                        ? 'Start Step 01 →'
                        : currentStep === 12
                        ? 'Finish Guide →'
                        : 'Next Step →'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const GuideModal = InteractiveUserGuideModal;
export default GuideModal;
