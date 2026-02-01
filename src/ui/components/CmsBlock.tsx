import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface CmsBlockProps {
  slug: string;
  id: number;
  content: Record<string, unknown>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Registry for custom component renderers
type BlockRenderer = React.ComponentType<CmsBlockProps>;
const rendererRegistry = new Map<string, BlockRenderer>();

/**
 * Register a custom renderer for a specific component slug.
 * This allows you to define how each component type should render.
 *
 * @example
 * registerBlockRenderer('hero_section', ({ id, content, className }) => (
 *   <section className={className}>
 *     <h1>{content.title as string}</h1>
 *     <p>{content.subtitle as string}</p>
 *   </section>
 * ));
 */
export function registerBlockRenderer(slug: string, renderer: BlockRenderer): void {
  rendererRegistry.set(slug, renderer);
}

/**
 * Unregister a renderer for a slug.
 */
export function unregisterBlockRenderer(slug: string): void {
  rendererRegistry.delete(slug);
}

/**
 * CmsBlock - Generic CMS component renderer.
 *
 * Renders content based on the component slug.
 * Register custom renderers with `registerBlockRenderer()` to control
 * how each component type is displayed.
 *
 * @example
 * <CmsBlock
 *   slug="hero_section"
 *   id={1}
 *   content={{ title: "Hello", subtitle: "World" }}
 *   className="my-hero"
 * />
 */
export function CmsBlock({
  slug,
  id,
  content,
  className,
  style,
  children,
}: CmsBlockProps) {
  const Renderer = rendererRegistry.get(slug);

  // If a custom renderer is registered, use it
  if (Renderer) {
    return (
      <Renderer
        slug={slug}
        id={id}
        content={content}
        className={className}
        style={style}
      >
        {children}
      </Renderer>
    );
  }

  // Default fallback: render content fields as a simple div
  // In production, you'd want to register proper renderers
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `CmsBlock: No renderer registered for slug "${slug}". Register one with registerBlockRenderer().`
    );
  }

  return (
    <div
      data-cms-id={id}
      data-cms-slug={slug}
      className={className}
      style={style}
    >
      {Object.entries(content).map(([key, value]) => (
        <div key={key} data-field={key}>
          {typeof value === 'string' ? value : JSON.stringify(value)}
        </div>
      ))}
      {children}
    </div>
  );
}
