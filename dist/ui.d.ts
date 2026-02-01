import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { CSSProperties, ReactNode } from 'react';

interface CmsBlockProps {
    slug: string;
    id: number;
    content: Record<string, unknown>;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}
type BlockRenderer = React.ComponentType<CmsBlockProps>;
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
declare function registerBlockRenderer(slug: string, renderer: BlockRenderer): void;
/**
 * Unregister a renderer for a slug.
 */
declare function unregisterBlockRenderer(slug: string): void;
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
declare function CmsBlock({ slug, id, content, className, style, children, }: CmsBlockProps): react_jsx_runtime.JSX.Element;

interface PageComponentData {
    id: number;
    component_slug: string;
    data: Record<string, unknown>;
    order?: number;
}
interface CmsPageProps {
    components: PageComponentData[];
    className?: string;
    style?: CSSProperties;
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
declare function CmsPage({ components, className, style, blockClassNames, }: CmsPageProps): react_jsx_runtime.JSX.Element;

interface TextFieldProps {
    value: string;
    className?: string;
    as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}
interface RichTextFieldProps {
    value: string;
    className?: string;
}
interface MediaFieldProps {
    value: string | {
        url: string;
        alt?: string;
    };
    className?: string;
    alt?: string;
}

/**
 * Renders a text field value.
 * Minimal styling - just renders the content in the specified element.
 */
declare function TextField({ value, className, as: Element, }: TextFieldProps): react_jsx_runtime.JSX.Element | null;

/**
 * Renders rich text/HTML content.
 * Uses dangerouslySetInnerHTML - ensure content is sanitized on the server.
 */
declare function RichTextField({ value, className }: RichTextFieldProps): react_jsx_runtime.JSX.Element | null;

/**
 * Renders a media field (image).
 * Handles both string URLs and object format with url/alt.
 */
declare function MediaField({ value, className, alt }: MediaFieldProps): react_jsx_runtime.JSX.Element | null;

export { CmsBlock, type CmsBlockProps, CmsPage, type CmsPageProps, MediaField, type MediaFieldProps, type PageComponentData, RichTextField, type RichTextFieldProps, TextField, type TextFieldProps, registerBlockRenderer, unregisterBlockRenderer };
