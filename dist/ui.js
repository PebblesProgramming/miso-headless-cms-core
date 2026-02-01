// src/ui/components/CmsBlock.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var rendererRegistry = /* @__PURE__ */ new Map();
function registerBlockRenderer(slug, renderer) {
  rendererRegistry.set(slug, renderer);
}
function unregisterBlockRenderer(slug) {
  rendererRegistry.delete(slug);
}
function CmsBlock({
  slug,
  id,
  content,
  className,
  style,
  children
}) {
  const Renderer = rendererRegistry.get(slug);
  if (Renderer) {
    return /* @__PURE__ */ jsx(
      Renderer,
      {
        slug,
        id,
        content,
        className,
        style,
        children
      }
    );
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `CmsBlock: No renderer registered for slug "${slug}". Register one with registerBlockRenderer().`
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-cms-id": id,
      "data-cms-slug": slug,
      className,
      style,
      children: [
        Object.entries(content).map(([key, value]) => /* @__PURE__ */ jsx("div", { "data-field": key, children: typeof value === "string" ? value : JSON.stringify(value) }, key)),
        children
      ]
    }
  );
}

// src/ui/components/CmsPage.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function CmsPage({
  components,
  className,
  style,
  blockClassNames = {}
}) {
  const sortedComponents = [...components].sort((a, b) => {
    return (a.order ?? 0) - (b.order ?? 0);
  });
  return /* @__PURE__ */ jsx2("div", { className, style, children: sortedComponents.map((component) => /* @__PURE__ */ jsx2(
    CmsBlock,
    {
      slug: component.component_slug,
      id: component.id,
      content: component.data,
      className: blockClassNames[component.component_slug]
    },
    component.id
  )) });
}

// src/ui/fields/TextField.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function TextField({
  value,
  className,
  as: Element = "p"
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsx3(Element, { className, children: value });
}

// src/ui/fields/RichTextField.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function RichTextField({ value, className }) {
  if (!value) return null;
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className,
      dangerouslySetInnerHTML: { __html: value }
    }
  );
}

// src/ui/fields/MediaField.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function MediaField({ value, className, alt = "" }) {
  if (!value) return null;
  const src = typeof value === "string" ? value : value.url;
  const imgAlt = typeof value === "string" ? alt : value.alt || alt;
  return /* @__PURE__ */ jsx5(
    "img",
    {
      src,
      alt: imgAlt,
      className
    }
  );
}
export {
  CmsBlock,
  CmsPage,
  MediaField,
  RichTextField,
  TextField,
  registerBlockRenderer,
  unregisterBlockRenderer
};
