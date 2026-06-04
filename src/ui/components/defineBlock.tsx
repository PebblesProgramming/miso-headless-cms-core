import type { CSSProperties } from 'react';
import type { FieldType } from '../../client/types.js';
import { registerBlockRenderer, type CmsBlockProps } from './CmsBlock.js';

// Map field definition to TypeScript value type
// For media: single:true → string, otherwise → string[]
type FieldValueType<F extends { readonly type: string; readonly single?: boolean }> =
  F['type'] extends 'text' | 'textarea' | 'richtext' | 'date' | 'select' ? string :
  F['type'] extends 'number' ? number :
  F['type'] extends 'boolean' ? boolean :
  F['type'] extends 'media' ? (F extends { readonly single: true } ? string : string[]) :
  F['type'] extends 'repeater' ? Record<string, unknown>[] :
  unknown;

// Infer a typed content object from a fields array (requires `as const`)
type InferContent<Fields extends readonly BlockFieldDef[]> = {
  [K in Fields[number]['name']]: FieldValueType<Extract<Fields[number], { readonly name: K }>>
};

interface BlockRenderProps<Content> {
  content: Content;
  id: number;
  className?: string;
  style?: CSSProperties;
}

type MediaAccept = 'image' | 'video' | 'any';

type SubFieldDef = {
  readonly name: string;
  readonly type: Exclude<FieldType, 'repeater'>;
  readonly label: string;
  readonly single?: boolean;
  readonly accept?: MediaAccept;
  readonly maxItems?: number;
  readonly maxSizeMB?: number;
};

type BlockFieldDef = {
  readonly name: string;
  readonly type: FieldType;
  readonly label: string;
  readonly single?: boolean;
  readonly accept?: MediaAccept;
  readonly maxItems?: number;
  readonly maxSizeMB?: number;
  readonly required?: boolean;
  readonly options?: string[];
  readonly sub_fields?: readonly SubFieldDef[];
};

interface BlockSchema {
  label: string;
  fields: BlockFieldDef[];
}

const schemaRegistry = new Map<string, BlockSchema>();

export function defineBlock<
  Fields extends readonly BlockFieldDef[]
>(options: {
  slug: string;
  label: string;
  fields: Fields;
  render: (props: BlockRenderProps<InferContent<Fields>>) => React.ReactElement | null;
}): void {
  const { slug, label, fields, render } = options;

  registerBlockRenderer(slug, function DefineBlockRenderer({ content, id, className, style }: CmsBlockProps) {
    return render({ content: content as InferContent<Fields>, id, className, style });
  });

  schemaRegistry.set(slug, { label, fields: fields as unknown as BlockFieldDef[] });
}

export function getRegisteredSchemas(): Record<string, BlockSchema> {
  return Object.fromEntries(schemaRegistry);
}
