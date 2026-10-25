/**
 * visual-editor — client entry point.
 *
 * NOTE: the Vite plugin is intentionally NOT exported from here. Import it
 * directly from `./tools/visual-editor/vite-plugin-source-map` inside
 * vite.config.ts so its Node-only dependencies never reach the browser bundle.
 */
export { VisualEditor } from './VisualEditor';
export type { VisualEditorProps } from './VisualEditor';

export { SelectionPanel } from './SelectionPanel';
export type { SelectionPanelProps } from './SelectionPanel';

export {
  useVisualEditor,
  extractElementInfo,
  resolveEditableElement,
  buildSelector,
  isVisualEditorNode,
  SOURCE_FILE_ATTR,
  SOURCE_LINE_ATTR,
  SOURCE_COL_ATTR,
} from './useVisualEditor';
export type { ElementInfo, UseVisualEditorResult } from './useVisualEditor';

export { formatElementContext, copyText, EMPTY_PROMPT_PLACEHOLDER } from './formatContext';
export { injectStyles, styles as visualEditorStyles } from './styles';
