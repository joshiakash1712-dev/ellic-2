import { useEffect } from 'react';
import { SelectionPanel } from './SelectionPanel';
import { injectStyles } from './styles';
import { useVisualEditor, type ElementInfo } from './useVisualEditor';

export interface VisualEditorProps {
  /** Start with edit mode already on. */
  defaultActive?: boolean;
  /** Corner for the toggle pill. Default: bottom-right. */
  position?: 'bottom-right' | 'bottom-left';
  /** Enable the Ctrl/Cmd + Shift + E hotkey. Default: true. */
  hotkey?: boolean;
}

function labelStyle(info: ElementInfo) {
  const above = info.rect.top > 26;
  return {
    top: above ? info.rect.top : info.rect.bottom,
    left: Math.max(4, info.rect.left),
    transform: above ? 'translateY(-100%)' : 'translateY(0)',
    borderRadius: above ? '4px 4px 0 0' : '0 0 4px 4px',
  } as const;
}

function labelText(info: ElementInfo) {
  const source = info.file
    ? `${info.file}${info.line ? `:${info.line}` : ''}`
    : info.classes
      ? info.classes.split(' ').slice(0, 3).join(' ')
      : info.selector;
  return `<${info.tag}> · ${source}`;
}

export function VisualEditor({
  defaultActive = false,
  position = 'bottom-right',
  hotkey = true,
}: VisualEditorProps) {
  const { active, toggle, hovered, selected, clearSelection } = useVisualEditor(defaultActive);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      if (event.key.toLowerCase() !== 'e') return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkey, toggle]);

  if (typeof document === 'undefined') return null;

  const showHover = active && hovered !== null && hovered.element !== selected?.element;
  const toggleSide =
    position === 'bottom-left' ? { left: 18 } : { right: selected ? 398 : 18 };

  return (
    <>
      <button
        type="button"
        className="ve-toggle"
        data-ve-ui=""
        data-active={active ? 'true' : 'false'}
        style={toggleSide}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }}
        aria-pressed={active}
        title={hotkey ? 'Toggle the visual editor (Ctrl/Cmd + Shift + E)' : 'Toggle the visual editor'}
      >
        <span className="ve-toggle-dot" />
        <span>{active ? 'Editing' : 'Edit UI'}</span>
        {hotkey ? <span className="ve-kbd">Ctrl⇧E</span> : null}
      </button>

      {active ? (
        <div className="ve-hint" data-ve-ui="" role="status">
          <strong>Visual editor</strong>
          <span className="ve-hint-sep">·</span>
          <span>click any element</span>
          <span className="ve-hint-sep">·</span>
          <span>Alt+click for parent</span>
          <span className="ve-hint-sep">·</span>
          <span>Esc to exit</span>
        </div>
      ) : null}

      {showHover ? (
        <>
          <div
            className="ve-highlight"
            style={{
              top: hovered.rect.top,
              left: hovered.rect.left,
              width: hovered.rect.width,
              height: hovered.rect.height,
            }}
          />
          <div className="ve-highlight-label" style={labelStyle(hovered)}>
            {labelText(hovered)}
          </div>
        </>
      ) : null}

      {selected ? (
        <>
          <div
            className="ve-selection"
            style={{
              top: selected.rect.top,
              left: selected.rect.left,
              width: selected.rect.width,
              height: selected.rect.height,
            }}
          />
          <div
            className="ve-highlight-label ve-selection-label"
            style={labelStyle(selected)}
          >
            {labelText(selected)}
          </div>
          <SelectionPanel info={selected} onClose={clearSelection} />
        </>
      ) : null}
    </>
  );
}

export default VisualEditor;
