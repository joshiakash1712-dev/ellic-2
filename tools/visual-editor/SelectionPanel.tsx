import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { copyText, formatElementContext } from './formatContext';
import type { ElementInfo } from './useVisualEditor';

export interface SelectionPanelProps {
  info: ElementInfo;
  onClose: () => void;
}

export function SelectionPanel({ info, onClose }: SelectionPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [info.element]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const contextText = useMemo(
    () => formatElementContext(info, prompt),
    [info, prompt],
  );

  const handleCopy = async () => {
    const ok = await copyText(contextText);
    if (ok) setCopied(true);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleCopy();
    }
  };

  const classChips = info.classes.split(' ').filter(Boolean).slice(0, 14);

  return (
    <aside
      className="ve-panel"
      data-ve-ui=""
      role="dialog"
      aria-label="Selected element"
    >
      <header className="ve-panel-head">
        <div>
          <h2 className="ve-panel-title">
            Selected &lt;{info.tag}&gt;
          </h2>
          <p className="ve-panel-sub">
            {info.file ? `${info.file}${info.line ? `:${info.line}` : ''}` : 'source not mapped'}
          </p>
        </div>
        <button
          type="button"
          className="ve-close"
          onClick={onClose}
          aria-label="Close selection panel"
          title="Close (Esc)"
        >
          ✕
        </button>
      </header>

      <div className="ve-panel-body">
        {info.file ? (
          <div className="ve-field">
            <span className="ve-label">Source</span>
            <div className="ve-value ve-value-file">
              {info.file}
              {info.line ? `:${info.line}` : ''}
            </div>
          </div>
        ) : (
          <div className="ve-field">
            <span className="ve-label">Source</span>
            <div className="ve-value">
              Not mapped. Restart the dev server with the visual-editor Vite plugin
              enabled.
            </div>
          </div>
        )}

        {info.text ? (
          <div className="ve-field">
            <span className="ve-label">Content</span>
            <div className="ve-value ve-value-quote">{info.text}</div>
          </div>
        ) : null}

        {classChips.length > 0 ? (
          <div className="ve-field">
            <span className="ve-label">Classes</span>
            <div className="ve-chips">
              {classChips.map((chip) => (
                <span className="ve-chip" key={chip}>
                  {chip}
                </span>
              ))}
              {info.classes.split(' ').filter(Boolean).length > classChips.length ? (
                <span className="ve-chip">
                  +{info.classes.split(' ').filter(Boolean).length - classChips.length}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="ve-field">
          <span className="ve-label">Selector</span>
          <div className="ve-value">{info.selector}</div>
        </div>

        <div className="ve-field">
          <label className="ve-label" htmlFor="ve-prompt">
            What should change?
          </label>
          <textarea
            id="ve-prompt"
            ref={textareaRef}
            className="ve-textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. make this headline shorter and drop the gradient"
            spellCheck={false}
          />
        </div>
      </div>

      <footer className="ve-panel-foot">
        <button
          type="button"
          className={`ve-btn ve-btn-primary${copied ? ' ve-copied' : ''}`}
          onClick={() => void handleCopy()}
          title="Copy the context block to the clipboard (Ctrl/Cmd + Enter)"
        >
          {copied ? 'Copied ✓' : 'Copy context'}
        </button>
        <button type="button" className="ve-btn" onClick={onClose}>
          Done
        </button>
      </footer>
    </aside>
  );
}

export default SelectionPanel;
