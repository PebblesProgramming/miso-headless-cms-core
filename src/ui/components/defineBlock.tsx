import type { CSSProperties } from 'react';
import type { FieldType } from '../../client/types.js';
import { registerBlockRenderer, type CmsBlockProps } from './CmsBlock.js';

// Map field types to TypeScript value types
type FieldValueType<T extends string> =
  T extends 'text' | 'textarea' | 'richtext' | 'date' | 'select' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'media' ? string | { url: string; alt?: string } :
  T extends 'repeater' ? Record<string, unknown>[] :
  unknown;

// Infer a typed content object from a fields array (requires `as const`)
type InferContent<Fields extends readonly { readonly name: string; readonly type: string }[]> = {
  [K in Fields[number]['name']]: FieldValueType<Extract<Fields[number], { readonly name: K }>['type']>
};

interface BlockRenderProps<Content> {
  content: Content;
  id: number;
  className?: string;
  style?: CSSProperties;
}

type SubFieldDef = {
  readonly name: string;
  readonly type: Exclude<FieldType, 'repeater'>;
  readonly label: string;
};

type BlockFieldDef = {
  readonly name: string;
  readonly type: FieldType;
  readonly label: string;
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
