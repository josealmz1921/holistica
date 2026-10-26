/** Data-only entry point: usable in an editor/API without importing UI or CSS. */
export { blockRegistry } from './registry/blocks';
export type { BlockType, BlockVariant } from './registry/blocks';
export { getBlockFields } from './registry/fields';
export type { EditorField } from './registry/fields';
export { createBlock } from './registry/create-block';
export { parsePageDocument, validatePageDocument, isSafeUrl } from './schemas/page.schema';
export type { ValidationIssue, ValidationOptions, PageValidationResult } from './schemas/page.schema';
export type * from './types/page';
