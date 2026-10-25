import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Ellix Connect — Light Theme & Daylight Contrast Rules Verification', () => {
  const cssPath = path.resolve(process.cwd(), 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('contains dedicated html.light / html.theme-light design tokens', () => {
    expect(cssContent).toContain('html.light,');
    expect(cssContent).toContain('--ellix-bg-level-0: #F8FAFC;');
    expect(cssContent).toContain('--ellix-surface-level-1: #FFFFFF;');
    expect(cssContent).toContain('--ellix-text-primary: #0F172A;');
  });

  it('sets application shell background and primary text color in daylight mode', () => {
    expect(cssContent).toMatch(/:where\(html\.light,\s*html\.theme-light\)\s*\.ellix-app-shell\s*\{[^}]*background-color:\s*#F1F5F9/);
    expect(cssContent).toMatch(/:where\(html\.light,\s*html\.theme-light\)\s*\.ellix-app-shell\s*\{[^}]*color:\s*#0F172A/);
  });

  it('maps level 0 dark backgrounds to daylight surfaces', () => {
    expect(cssContent).toContain('.bg-\\[\\#0A0E1A\\],');
    expect(cssContent).toContain('.bg-slate-950,');
    expect(cssContent).toMatch(/background-color:\s*#F8FAFC\s*!important;/);
  });

  it('maps level 1 dark card surfaces to pure white (#FFFFFF)', () => {
    expect(cssContent).toContain('.bg-\\[\\#121826\\],');
    expect(cssContent).toContain('.bg-slate-900,');
    expect(cssContent).toMatch(/background-color:\s*#FFFFFF\s*!important;/);
  });

  it('maps level 2 dropdowns, popovers, and elevated modals to white', () => {
    expect(cssContent).toContain('.bg-\\[\\#161D2C\\],');
    expect(cssContent).toContain('.bg-slate-800,');
    expect(cssContent).toMatch(/background-color:\s*#F1F5F9\s*!important;/);
  });

  it('converts text-white and text-slate-100 to high-contrast ink (#0F172A) on cards', () => {
    expect(cssContent).toContain('.text-white,');
    expect(cssContent).toContain('.text-slate-100');
    expect(cssContent).toMatch(/color:\s*#0F172A\s*!important;/);
  });

  it('preserves crisp white (#FFFFFF) text on solid saturated buttons and badges', () => {
    expect(cssContent).toContain('.bg-blue-600,');
    expect(cssContent).toContain('.bg-sky-500,');
    expect(cssContent).toContain('.bg-rose-600,');
    expect(cssContent).toContain('.bg-indigo-600,');
    expect(cssContent).toMatch(/color:\s*#FFFFFF\s*!important;/);
  });

  it('neutralizes dark borders and shadows for crisp daylight elevation', () => {
    expect(cssContent).toMatch(/border-color:\s*#CBD5E1\s*!important;/);
    expect(cssContent).toMatch(/border-color:\s*#E2E8F0\s*!important;/);
    expect(cssContent).toMatch(/box-shadow:\s*0 2px 10px rgba\(15, 23, 42, 0\.06\)/);
  });

  it('provides light theme overrides for Recharts data visualizations', () => {
    expect(cssContent).toContain('.recharts-cartesian-grid line');
    expect(cssContent).toContain('.recharts-default-tooltip');
    expect(cssContent).toContain('.recharts-tooltip-label');
  });
});
