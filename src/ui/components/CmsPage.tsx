import React from 'react';
import type { CSSProperties } from 'react';
import { CmsBlock } from './CmsBlock.js';

export interface PageComponentData {
  id: number;
  component_slug: string;
  data: Record<string, unknown>;
  order?: number;
}

export interface CmsPageProps {
  components: PageComponentData[];
  className?: string;
  style?: CSSProperties;
  // Optional: provide custom class names per component slug
  blockClassNames?: Record<string, string>;
}

/**
 * CmsPage - Renders a full page with all its CmsBlocks.
 * Components are rendered in order based on the `order` field.
 *
 * @example
 * const page = await cmsClient.getPage('home');
 *
 * <CmsPage components={page.components} />
 *
 * // With custom class names per block type
 * <CmsPage
 *   components={page.components}
 *   blockClassNames={{
 *     hero_section: 'my-hero-styles',
 *     text_area: 'prose prose-lg',
 *   }}
 * />
 */
export function CmsPage({
  components,
  className,
  style,
  blockClassNames = {},
}: CmsPageProps) {
  // Sort by order if available
  const sortedComponents = [...components].sort((a, b) => {
    return (a.order ?? 0) - (b.order ?? 0);
  });

  return (
    <div className={className} style={style}>
      {sortedComponents.map((component) => (
        <CmsBlock
          key={component.id}
          slug={component.component_slug}
          id={component.id}
          content={component.data}
          className={blockClassNames[component.component_slug]}
        />
      ))}
    </div>
  );
}
