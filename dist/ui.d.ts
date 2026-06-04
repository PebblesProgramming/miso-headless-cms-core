import * as react_jsx_runtime from 'react/jsx-runtime';
import React$1, { CSSProperties, ReactNode } from 'react';
import { FieldType, CmsClient, FormDefinition, FormFieldDefinition, FormSubmitResponse, MediaInput, MediaItem } from './index.js';
export { MediaObject, firstMedia, isVideo, toMediaArray } from './index.js';

interface CmsBlockProps {
    slug: string;
    id: number;
    content: Record<string, unknown>;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}
type BlockRenderer = React$1.ComponentType<CmsBlockProps>;
/**
 * @deprecated Use `defineBlock` instead — it registers both the renderer and the schema in one call.
 *
 * Register a custom renderer for a specific component slug.
 */
declare function registerBlockRenderer(slug: string, renderer: BlockRenderer): void;
/**
 * @deprecated Use `defineBlock` instead.
 *
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

type FieldValueType<F extends {
    readonly type: string;
    readonly single?: boolean;
}> = F['type'] extends 'text' | 'textarea' | 'richtext' | 'date' | 'select' ? string : F['type'] extends 'number' ? number : F['type'] extends 'boolean' ? boolean : F['type'] extends 'media' ? (F extends {
    readonly single: true;
} ? string : string[]) : F['type'] extends 'repeater' ? Record<string, unknown>[] : unknown;
type InferContent<Fields extends readonly BlockFieldDef[]> = {
    [K in Fields[number]['name']]: FieldValueType<Extract<Fields[number], {
        readonly name: K;
    }>>;
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
declare function defineBlock<Fields extends readonly BlockFieldDef[]>(options: {
    slug: string;
    label: string;
    fields: Fields;
    render: (props: BlockRenderProps<InferContent<Fields>>) => React.ReactElement | null;
}): void;
declare function getRegisteredSchemas(): Record<string, BlockSchema>;

interface CmsPreviewListenerProps {
    renderLayout: (children: ReactNode) => ReactNode;
}
declare function CmsPreviewListener({ renderLayout }: CmsPreviewListenerProps): react_jsx_runtime.JSX.Element | null;

interface TextFieldProps {
    value: string;
    className?: string;
    as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}
interface RichTextFieldProps {
    value: string;
    className?: string;
    /** Apply Tailwind Typography `prose` class for styled rich text rendering */
    prose?: boolean;
}
interface MediaFieldProps {
    /** A string, object, or array — the first valid item is rendered. */
    value: MediaInput;
    className?: string;
    alt?: string;
    /** Rendered when there is no media (default: nothing). */
    fallback?: ReactNode;
    /** Show native controls. Defaults to `!autoPlay`. */
    controls?: boolean;
    autoPlay?: boolean;
    /** Defaults to `autoPlay` (browsers require muted for autoplay). */
    muted?: boolean;
    loop?: boolean;
    /** Defaults to `true`. */
    playsInline?: boolean;
}
interface MediaGalleryProps {
    /** A string, object, or array — normalized to a list of items. */
    value: MediaInput;
    /** Class on the wrapper element. */
    className?: string;
    /** Class on each default-rendered item (ignored when `children` is given). */
    itemClassName?: string;
    /** Rendered when there are no items (default: nothing). */
    fallback?: ReactNode;
    /** Render-prop to control per-item markup. */
    children?: (item: MediaItem, index: number) => ReactNode;
}
type FormErrors = Record<string, string>;
interface FormFieldRenderProps {
    field: FormFieldDefinition;
    value: string | boolean;
    onChange: (value: string | boolean) => void;
    error?: string;
    inputClassName?: string;
    labelClassName?: string;
    fieldClassName?: string;
    errorClassName?: string;
}
interface CmsFormProps {
    slug?: string;
    client?: CmsClient;
    form?: FormDefinition;
    className?: string;
    fieldClassName?: string;
    labelClassName?: string;
    inputClassName?: string;
    errorClassName?: string;
    buttonClassName?: string;
    successClassName?: string;
    errorContainerClassName?: string;
    loadingClassName?: string;
    submitLabel?: string;
    submittingLabel?: string;
    loadingContent?: ReactNode;
    successContent?: ReactNode;
    errorContent?: ReactNode;
    renderField?: (props: FormFieldRenderProps) => ReactNode;
    onSuccess?: (response: FormSubmitResponse) => void;
    onError?: (error: Error) => void;
    onLoadError?: (error: Error) => void;
    resetOnSuccess?: boolean;
    children?: ReactNode;
}

/**
 * Renders a text field value.
 * Minimal styling - just renders the content in the specified element.
 */
declare function TextField({ value, className, as: Element, }: TextFieldProps): react_jsx_runtime.JSX.Element | null;

/**
 * CSS baseline for unstyled rich text content produced by the CMS.
 *
 * Inject this into your global stylesheet (or a <style> tag) when you are NOT
 * using Tailwind Typography (`prose`). It targets `[data-cms-rich-text]` to
 * avoid collisions with the rest of your styles.
 *
 * @example
 * // In your global CSS file:
 * import { RICH_TEXT_BASE_CSS } from '@miso-software/headless-cms-core/ui';
 * // paste the string into a <style> tag or CSS-in-JS solution
 *
 * // Or with a <style> tag in your layout:
 * <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_BASE_CSS }} />
 */
declare const RICH_TEXT_BASE_CSS: string;
/**
 * Renders rich text/HTML content from the CMS.
 * Uses dangerouslySetInnerHTML — content is generated by the CMS rich text editor
 * and is trusted server-side output.
 *
 * The CMS rich text editor can produce the following HTML:
 *
 * **Block elements**
 * - `<p>` paragraphs (may have `style="text-align: center|right|justify"`)
 * - `<h1>`, `<h2>`, `<h3>` headings (may have text-align style)
 * - `<ul>`, `<ol>`, `<li>` lists
 * - `<blockquote>` block quotes
 * - `<hr>` horizontal rules
 * - `<pre><code>` code blocks
 *
 * **Inline elements**
 * - `<strong>` bold
 * - `<em>` italic
 * - `<u>` underline
 * - `<s>` strikethrough
 * - `<sub>` subscript
 * - `<sup>` superscript
 * - `<code>` inline code
 * - `<a href="...">` links
 * - `<span style="color: #hex">` text colour
 * - `<mark style="background-color: #hex">` highlighted text
 *
 * **Media**
 * - `<img src="...">` — may include `style="width: X%; height: auto; display: block;"`
 *   when the editor user resized the image
 *
 * @example
 * // Basic — browser defaults apply
 * <RichTextField value={post.content} />
 *
 * // Recommended for blog posts: Tailwind Typography handles all elements beautifully
 * <RichTextField value={post.content} prose />
 *
 * // Without Tailwind Typography — add RICH_TEXT_BASE_CSS to your global styles
 * // for proper code block and blockquote styling:
 * import { RICH_TEXT_BASE_CSS } from '@miso-software/headless-cms-core/ui';
 * <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_BASE_CSS }} />
 * <RichTextField value={post.content} />
 *
 * // Custom class
 * <RichTextField value={post.content} className="my-content my-content--blog" />
 */
declare function RichTextField({ value, className, prose }: RichTextFieldProps): react_jsx_runtime.JSX.Element | null;

/**
 * Renders a SINGLE media item (image or video).
 *
 * Accepts a string, an object, or an **array** (uses the first item) — so it is
 * tolerant of the CMS always returning media as a list. Video is detected by
 * MIME type (preferred) or file extension and rendered as a `<video>`.
 *
 * For multiple items use `<MediaGallery>`; for a custom layout/carousel use
 * `toMediaArray()` and render yourself.
 */
declare function MediaField({ value, className, alt, fallback, controls, autoPlay, muted, loop, playsInline, }: MediaFieldProps): react_jsx_runtime.JSX.Element;

/**
 * Renders MULTIPLE media items (images and/or videos).
 *
 * By default each item is rendered via `<MediaField>` inside a wrapper `<div>`.
 * Pass a `children` render-prop to control the per-item markup (captions,
 * links, lightbox triggers, …). Embeds (YouTube/Vimeo) are intentionally out of
 * scope — build a custom block with `toMediaArray()` for those.
 */
declare function MediaGallery({ value, className, itemClassName, fallback, children, }: MediaGalleryProps): react_jsx_runtime.JSX.Element;

declare function CmsForm({ slug, client, form: formProp, className, fieldClassName, labelClassName, inputClassName, errorClassName, buttonClassName, successClassName, errorContainerClassName, loadingClassName, submitLabel, submittingLabel, loadingContent, successContent, errorContent, renderField, onSuccess, onError, onLoadError, resetOnSuccess, children, }: CmsFormProps): react_jsx_runtime.JSX.Element | null;

declare function DefaultFormField({ field, value, onChange, error, inputClassName, labelClassName, fieldClassName, errorClassName, }: FormFieldRenderProps): react_jsx_runtime.JSX.Element;

/**
 * Validate form data against field definitions.
 * Mirrors the CMS backend's FormDefinition::buildValidationRules().
 *
 * @returns Record of field name to error message. Empty object means valid.
 */
declare function validateFormData(fields: FormFieldDefinition[], data: Record<string, string | boolean>): Record<string, string>;

export { CmsBlock, type CmsBlockProps, CmsForm, type CmsFormProps, CmsPage, type CmsPageProps, CmsPreviewListener, DefaultFormField, type FormErrors, type FormFieldRenderProps, MediaField, type MediaFieldProps, MediaGallery, type MediaGalleryProps, MediaInput, MediaItem, type PageComponentData, RICH_TEXT_BASE_CSS, RichTextField, type RichTextFieldProps, TextField, type TextFieldProps, defineBlock, getRegisteredSchemas, registerBlockRenderer, unregisterBlockRenderer, validateFormData };
