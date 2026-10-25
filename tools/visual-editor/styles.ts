/**
 * visual-editor / styles
 *
 * Injected once into <head>. All selectors are namespaced with `ve-` so the
 * tool never collides with the host app's CSS or Tailwind utilities.
 */
export const STYLE_ELEMENT_ID = 'visual-editor-styles';

export const styles = `
.ve-toggle {
  position: fixed;
  bottom: 18px;
  z-index: 2147483000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid #3f3f46;
  border-radius: 999px;
  background: #18181b;
  color: #fafafa;
  font: 600 12px/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, right 160ms ease;
}
.ve-toggle:hover { background: #27272a; border-color: #52525b; transform: translateY(-1px); }
.ve-toggle:active { transform: translateY(0); }
.ve-toggle[data-active="true"] {
  background: #0369a1;
  border-color: #0ea5e9;
}
.ve-toggle-dot {
  width: 7px; height: 7px; border-radius: 999px; background: #71717a;
}
.ve-toggle[data-active="true"] .ve-toggle-dot {
  background: #7dd3fc;
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.18);
}
.ve-kbd {
  font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 2px 5px;
  border-radius: 4px;
  border: 1px solid #3f3f46;
  color: #a1a1aa;
  background: #27272a;
}

.ve-hint {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #3f3f46;
  background: rgba(24, 24, 27, 0.94);
  color: #e4e4e7;
  font: 500 12px/1.2 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  white-space: nowrap;
}
.ve-hint strong { color: #7dd3fc; font-weight: 600; }
.ve-hint-sep { color: #52525b; }

.ve-highlight,
.ve-selection {
  position: fixed;
  z-index: 2147482998;
  pointer-events: none;
  border-radius: 3px;
  transition: top 60ms linear, left 60ms linear, width 60ms linear, height 60ms linear;
}
.ve-highlight {
  border: 1.5px solid rgba(14, 165, 233, 0.9);
  background: rgba(14, 165, 233, 0.08);
}
.ve-selection {
  border: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.09);
  z-index: 2147482999;
}
.ve-highlight-label {
  position: fixed;
  z-index: 2147483000;
  transform: translateY(-100%);
  padding: 3px 7px;
  border-radius: 4px 4px 0 0;
  background: #0ea5e9;
  color: #06283d;
  font: 600 10px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
  pointer-events: none;
  max-width: 70vw;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ve-selection-label { background: #22c55e; color: #04240f; }

.ve-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483001;
  width: 380px;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  background: #18181b;
  color: #e4e4e7;
  border-left: 1px solid #3f3f46;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.32);
  font: 400 13px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
.ve-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #27272a;
}
.ve-panel-title {
  margin: 0;
  font: 600 13px/1.3 ui-sans-serif, system-ui, sans-serif;
  color: #fafafa;
}
.ve-panel-sub {
  margin: 3px 0 0;
  font: 400 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #a1a1aa;
  word-break: break-all;
}
.ve-close {
  flex: none;
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  background: transparent;
  color: #a1a1aa;
  font-size: 14px;
  cursor: pointer;
}
.ve-close:hover { background: #27272a; color: #fafafa; }

.ve-panel-body {
  flex: 1;
  overflow: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ve-field { display: flex; flex-direction: column; gap: 5px; }
.ve-label {
  font: 600 10px/1 ui-sans-serif, system-ui, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #71717a;
}
.ve-value {
  font: 400 12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #d4d4d8;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 6px;
  padding: 7px 9px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 132px;
  overflow: auto;
  user-select: text;
}
.ve-value-quote { color: #fbbf24; }
.ve-value-file { color: #7dd3fc; }
.ve-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.ve-chip {
  padding: 2px 7px;
  border-radius: 999px;
  background: #27272a;
  border: 1px solid #3f3f46;
  color: #d4d4d8;
  font: 500 10px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ve-textarea {
  width: 100%;
  min-height: 86px;
  resize: vertical;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #3f3f46;
  background: #09090b;
  color: #fafafa;
  font: 400 13px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  outline: none;
}
.ve-textarea:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.18); }
.ve-textarea::placeholder { color: #52525b; }

.ve-panel-foot {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #27272a;
  background: #131316;
}
.ve-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 7px;
  border: 1px solid #3f3f46;
  background: #27272a;
  color: #fafafa;
  font: 600 12px/1.2 ui-sans-serif, system-ui, sans-serif;
  cursor: pointer;
  transition: background 110ms ease, border-color 110ms ease;
}
.ve-btn:hover { background: #3f3f46; }
.ve-btn-primary {
  background: #0284c7;
  border-color: #0ea5e9;
}
.ve-btn-primary:hover { background: #0ea5e9; }
.ve-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ve-copied {
  color: #86efac !important;
  border-color: #166534 !important;
}

@media (max-width: 640px) {
  .ve-panel {
    top: auto;
    left: 0;
    width: 100%;
    height: 62vh;
    border-left: none;
    border-top: 1px solid #3f3f46;
    border-radius: 14px 14px 0 0;
  }
  .ve-hint { top: 8px; font-size: 11px; }
  .ve-toggle { bottom: 12px; }
}
`;

export function injectStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = styles;
  document.head.appendChild(style);
}
