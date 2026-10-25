import type { ElementInfo } from './useVisualEditor';

export const EMPTY_PROMPT_PLACEHOLDER = '(describe the change you want)';

function quote(text: string): string {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  return singleLine.length > 0 ? `> ${singleLine}` : '> (no text content)';
}

function sourceLine(info: ElementInfo): string {
  if (!info.file) {
    return 'unknown (no data-source attribute - is the Vite plugin enabled and the dev server restarted?)';
  }
  return info.line ? `${info.file}:${info.line}` : info.file;
}

/**
 * Builds the copy-paste block handed to the coding agent.
 * Kept deliberately terse: the agent needs the file, the node, the current
 * content and the intent - nothing else.
 */
export function formatElementContext(info: ElementInfo, prompt?: string): string {
  const lines: string[] = [];

  lines.push('### Target element');
  lines.push(`- Source: ${sourceLine(info)}`);
  lines.push(`- Tag: <${info.tag}>`);
  if (info.id) lines.push(`- Id: ${info.id}`);
  if (info.classes) lines.push(`- Classes: ${info.classes}`);
  lines.push(`- Selector: ${info.selector}`);
  if (info.parentTag) {
    const parent = info.parentClasses
      ? `<${info.parentTag} class="${info.parentClasses}">`
      : `<${info.parentTag}>`;
    lines.push(`- Parent: ${parent}`);
  }

  lines.push('');
  lines.push('### Current content');
  lines.push(quote(info.text));

  lines.push('');
  lines.push('### Requested change');
  lines.push(prompt?.trim() ? prompt.trim() : EMPTY_PROMPT_PLACEHOLDER);

  return lines.join('\n');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
