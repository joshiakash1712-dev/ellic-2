/**
 * visual-editor / useVisualEditor
 *
 * Edit-mode state plus the DOM -> source context extraction used by the panel.
 * Framework-agnostic: works on any React app rendered into the document.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export const SOURCE_FILE_ATTR = 'data-source-file';
export const SOURCE_LINE_ATTR = 'data-source-line';
export const SOURCE_COL_ATTR = 'data-source-col';

const SKIP_TAGS = new Set([
  'HTML',
  'HEAD',
  'BODY',
  'SCRIPT',
  'STYLE',
  'LINK',
  'META',
  'TITLE',
  'NOSCRIPT',
  'TEMPLATE',
]);

const MAX_TEXT_LENGTH = 400;

export interface ElementInfo {
  element: Element;
  tag: string;
  id: string;
  classes: string;
  text: string;
  selector: string;
  parentTag: string | null;
  parentClasses: string;
  file: string | null;
  line: string | null;
  col: string | null;
  rect: DOMRect;
}

function collapse(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function readText(el: Element): string {
  if (el instanceof HTMLInputElement) {
    return collapse(el.value || el.placeholder || '');
  }
  if (el instanceof HTMLTextAreaElement) {
    return collapse(el.value || el.placeholder || '');
  }
  if (el instanceof HTMLImageElement) {
    return collapse(el.alt || el.currentSrc || el.src || '');
  }
  return collapse(el.textContent ?? '').slice(0, MAX_TEXT_LENGTH);
}

export function buildSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current.nodeType === 1 && parts.length < 5 && current !== document.body) {
    if (current.id) {
      parts.unshift(`#${current.id}`);
      break;
    }
    const classes = Array.from(current.classList)
      .filter((name) => !name.startsWith('ve-') && name.length < 40)
      .slice(0, 2);
    const tag = current.tagName.toLowerCase();
    parts.unshift(classes.length > 0 ? `${tag}.${classes.join('.')}` : tag);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

export function isVisualEditorNode(node: Element | null): boolean {
  return Boolean(node?.closest('[data-ve-ui]'));
}

export function extractElementInfo(element: Element): ElementInfo {
  const opening = element as HTMLElement;
  let file: string | null = null;
  let line: string | null = null;
  let col: string | null = null;

  const sourceNode = element.closest(`[${SOURCE_FILE_ATTR}]`);
  if (sourceNode) {
    file = sourceNode.getAttribute(SOURCE_FILE_ATTR);
    line = sourceNode.getAttribute(SOURCE_LINE_ATTR);
    col = sourceNode.getAttribute(SOURCE_COL_ATTR);
  }

  const parent = element.parentElement;

  return {
    element,
    tag: element.tagName.toLowerCase(),
    id: element.id || '',
    classes: typeof opening.className === 'string' ? collapse(opening.className) : '',
    text: readText(element),
    selector: buildSelector(element),
    parentTag: parent ? parent.tagName.toLowerCase() : null,
    parentClasses:
      parent && typeof (parent as HTMLElement).className === 'string'
        ? collapse((parent as HTMLElement).className).slice(0, 160)
        : '',
    file,
    line,
    col,
    rect: element.getBoundingClientRect(),
  };
}

/**
 * Resolve the element worth editing for a raw pointer target.
 * Prefers the closest element carrying source info; with `useParent` it walks
 * one mapped level up (Alt + click), which is how you grab a heading instead of
 * the <span> wrapped around its text.
 */
export function resolveEditableElement(
  target: Element | null,
  useParent = false,
): Element | null {
  if (!target) return null;
  if (isVisualEditorNode(target)) return null;

  let mapped: Element | null = null;
  let node: Element | null = target;

  while (node && node !== document.body) {
    if (node.tagName && SKIP_TAGS.has(node.tagName)) return null;
    if (node.hasAttribute(SOURCE_FILE_ATTR)) {
      mapped = node;
      break;
    }
    node = node.parentElement;
  }

  if (!useParent) return mapped ?? (target === document.body ? null : target);

  let ancestor = (mapped ?? target).parentElement;
  while (ancestor && ancestor !== document.body) {
    if (ancestor.hasAttribute(SOURCE_FILE_ATTR)) return ancestor;
    ancestor = ancestor.parentElement;
  }

  return mapped ?? (target === document.body ? null : target);
}

export interface UseVisualEditorResult {
  active: boolean;
  setActive: (next: boolean) => void;
  toggle: () => void;
  hovered: ElementInfo | null;
  selected: ElementInfo | null;
  select: (element: Element | null) => void;
  clearSelection: () => void;
  refreshRects: () => void;
}

export function useVisualEditor(initialActive = false): UseVisualEditorResult {
  const [active, setActiveState] = useState(initialActive);
  const [hovered, setHovered] = useState<ElementInfo | null>(null);
  const [selected, setSelected] = useState<ElementInfo | null>(null);
  const rafRef = useRef<number | null>(null);
  const selectedRef = useRef<ElementInfo | null>(null);

  selectedRef.current = selected;

  const setActive = useCallback((next: boolean) => {
    setActiveState(next);
    if (!next) {
      setHovered(null);
      setSelected(null);
    }
  }, []);

  const toggle = useCallback(() => {
    setActiveState((prev) => {
      if (prev) {
        setHovered(null);
        setSelected(null);
      }
      return !prev;
    });
  }, []);

  const select = useCallback((element: Element | null) => {
    if (!element) {
      setSelected(null);
      return;
    }
    setSelected(extractElementInfo(element));
  }, []);

  const clearSelection = useCallback(() => setSelected(null), []);

  const refreshRects = useCallback(() => {
    setHovered((prev) =>
      prev ? { ...prev, rect: prev.element.getBoundingClientRect() } : prev,
    );
    setSelected((prev) =>
      prev ? { ...prev, rect: prev.element.getBoundingClientRect() } : prev,
    );
  }, []);

  useEffect(() => {
    if (!active) return;

    const onPointerMove = (event: PointerEvent) => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const element = resolveEditableElement(target, event.altKey);
        if (!element) {
          setHovered(null);
          return;
        }
        setHovered((prev) =>
          prev?.element === element ? prev : extractElementInfo(element),
        );
      });
    };

    const onPointerLeave = () => setHovered(null);

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (isVisualEditorNode(target)) return;

      const element = resolveEditableElement(target, event.altKey);
      if (!element) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setSelected(extractElementInfo(element));
    };

    const onSubmit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const onScrollOrResize = () => refreshRects();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selectedRef.current) {
        setSelected(null);
        return;
      }
      setActiveState(false);
      setHovered(null);
    };

    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerleave', onPointerLeave, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerleave', onPointerLeave, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.body.style.cursor = previousCursor;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, refreshRects]);

  return { active, setActive, toggle, hovered, selected, select, clearSelection, refreshRects };
}

export default useVisualEditor;
