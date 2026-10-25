/**
 * visual-editor / vite-plugin-source-map
 *
 * Dev-only Vite plugin that stamps every intrinsic (lowercase) JSX element with
 * `data-source-file`, `data-source-line` and `data-source-col` attributes, so the
 * in-browser editor can map a clicked DOM node straight back to the source.
 *
 * Design notes:
 *  - Only `apply: 'serve'` (dev server). Production builds are untouched.
 *  - Attributes are inserted by splicing the original source string, never by
 *    regenerating the AST, so formatting and line numbers stay identical.
 *  - Only one dependency: `@babel/parser` (devDependency of the host project).
 *  - Custom components (`<Hero />`) are skipped: unknown props on typed
 *    components are TypeScript errors, and React would not forward them to the
 *    DOM anyway. Only real DOM tags are annotated.
 *  - Elements inside `<svg>` are skipped to avoid attribute noise on paths.
 */
import { parse } from '@babel/parser';
import path from 'node:path';
import type { Plugin } from 'vite';

export interface VisualEditorPluginOptions {
  /** Attribute name prefix. Default: `data-source`. */
  attributePrefix?: string;
  /** Files to transform. Default: /\.(t|j)sx$/ */
  include?: RegExp;
  /** Files to skip. Default: node_modules + .d.ts */
  exclude?: RegExp;
}

interface Insertion {
  pos: number;
  text: string;
}

const METADATA_KEYS = new Set([
  'loc',
  'range',
  'start',
  'end',
  'extra',
  'leadingComments',
  'trailingComments',
  'innerComments',
  'comments',
  'tokens',
  'errors',
]);

function tagNameOf(openingElement: any): string | null {
  const name = openingElement?.name;
  if (!name) return null;
  if (name.type === 'JSXIdentifier' && typeof name.name === 'string') return name.name;
  if (
    name.type === 'JSXMemberExpression' &&
    name.property?.type === 'JSXIdentifier' &&
    typeof name.property.name === 'string'
  ) {
    return name.property.name;
  }
  return null;
}

/**
 * Which JSX names are worth stamping?
 *  - intrinsic tags: `<div>`, `<h1>` ...
 *  - member expressions whose property is a DOM tag: `<motion.h1>`, `<motion.div>`
 *    (framer-motion forwards unknown `data-*` props to the real node)
 *  - PascalCase components are skipped: they would receive the attribute as a
 *    prop and never forward it to the DOM.
 */
function annatableTag(nameNode: any): string | null {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier' && typeof nameNode.name === 'string') {
    return /^[a-z]/.test(nameNode.name) ? nameNode.name : null;
  }
  if (
    nameNode.type === 'JSXMemberExpression' &&
    nameNode.property?.type === 'JSXIdentifier' &&
    typeof nameNode.property.name === 'string'
  ) {
    return /^[a-z]/.test(nameNode.property.name) ? nameNode.property.name : null;
  }
  return null;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function visualEditorSourceMap(options: VisualEditorPluginOptions = {}): Plugin {
  const prefix = options.attributePrefix ?? 'data-source';
  const include = options.include ?? /\.(?:t|j)sx$/;
  const exclude = options.exclude ?? /node_modules|\.d\.ts$/;

  return {
    name: 'visual-editor:source-map',
    apply: 'serve',
    enforce: 'pre',

    transform(code, rawId) {
      const id = rawId.split('?')[0] ?? '';
      if (!id || !include.test(id) || exclude.test(id)) return null;
      if (!code.includes('<')) return null;

      let ast: any;
      try {
        ast = parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
          errorRecovery: true,
        });
      } catch {
        return null;
      }

      const relativeFile = path
        .relative(process.cwd(), id)
        .split(path.sep)
        .join('/');

      const insertions: Insertion[] = [];

      const walk = (node: any, insideSvg: boolean): void => {
        if (!node || typeof node !== 'object') return;

        if (Array.isArray(node)) {
          for (const child of node) walk(child, insideSvg);
          return;
        }

        if (typeof node.type !== 'string') return;

        let nextInsideSvg = insideSvg;

        if (node.type === 'JSXElement' && tagNameOf(node.openingElement) === 'svg') {
          nextInsideSvg = true;
        }

        if (node.type === 'JSXOpeningElement' && !insideSvg) {
          const name = node.name;
          const tag = annatableTag(name);
          if (
            tag !== null &&
            typeof name.end === 'number' &&
            node.loc?.start
          ) {
            const alreadyStamped = (node.attributes ?? []).some(
              (attr: any) =>
                attr?.type === 'JSXAttribute' &&
                attr.name?.type === 'JSXIdentifier' &&
                attr.name.name === `${prefix}-file`,
            );

            if (!alreadyStamped) {
              insertions.push({
                pos: name.end,
                text:
                  ` ${prefix}-file="${escapeAttribute(relativeFile)}"` +
                  ` ${prefix}-line="${node.loc.start.line}"` +
                  ` ${prefix}-col="${node.loc.start.column + 1}"`,
              });
            }
          }
        }

        for (const key of Object.keys(node)) {
          if (METADATA_KEYS.has(key)) continue;
          walk(node[key], nextInsideSvg);
        }
      };

      walk(ast, false);

      if (insertions.length === 0) return null;

      insertions.sort((a, b) => b.pos - a.pos);
      let output = code;
      for (const insertion of insertions) {
        output = output.slice(0, insertion.pos) + insertion.text + output.slice(insertion.pos);
      }

      return { code: output, map: null };
    },
  };
}

/** Alias kept for readability in vite config `plugins` arrays. */
export const sourceMapPlugin = visualEditorSourceMap;
