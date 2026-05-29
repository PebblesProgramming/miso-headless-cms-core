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

// src/ui/components/defineBlock.tsx
var schemaRegistry = /* @__PURE__ */ new Map();
function defineBlock(options) {
  const { slug, label, fields, render } = options;
  registerBlockRenderer(slug, function DefineBlockRenderer({ content, id, className, style }) {
    return render({ content, id, className, style });
  });
  schemaRegistry.set(slug, { label, fields });
}
function getRegisteredSchemas() {
  return Object.fromEntries(schemaRegistry);
}

// src/ui/components/CmsPreviewListener.tsx
import { useEffect, useRef, useState } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function CmsPreviewListener({ renderLayout }) {
  const [previewData, setPreviewData] = useState(null);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "miso-preview-ready" }, "*");
    }
    const handler = (event) => {
      if (event.data?.type !== "miso-preview-update") return;
      setPreviewData(event.data);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  if (!previewData) return null;
  const blocks = previewData.components.map((comp) => /* @__PURE__ */ jsx3(
    CmsBlock,
    {
      slug: comp.component_slug,
      id: comp.id,
      content: comp.data
    },
    comp.id
  ));
  return /* @__PURE__ */ jsxs2("div", { className: "fixed inset-0 z-[9999] flex flex-col", children: [
    /* @__PURE__ */ jsxs2("div", { className: "shrink-0 flex items-center justify-between bg-slate-900/95 backdrop-blur-sm px-4 py-2 text-xs text-white/80", children: [
      /* @__PURE__ */ jsxs2("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx3("span", { className: "h-2 w-2 rounded-full bg-orange-400 animate-pulse" }),
        "Voorvertoning \u2014 wijzigingen zijn nog niet opgeslagen"
      ] }),
      /* @__PURE__ */ jsx3(
        "button",
        {
          onClick: () => setPreviewData(null),
          className: "text-white/60 hover:text-white transition ml-4",
          children: "Sluiten \u2715"
        }
      )
    ] }),
    /* @__PURE__ */ jsx3("div", { ref: scrollRef, className: "flex-1 overflow-y-auto", children: renderLayout(blocks) })
  ] });
}

// src/ui/fields/TextField.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function TextField({
  value,
  className,
  as: Element = "p"
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsx4(Element, { className, children: value });
}

// src/ui/fields/RichTextField.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var RICH_TEXT_BASE_CSS = `
[data-cms-rich-text] code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  background-color: rgba(0, 0, 0, 0.06);
  padding: 0.15em 0.35em;
  border-radius: 3px;
}
[data-cms-rich-text] pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  background-color: rgba(0, 0, 0, 0.06);
  padding: 1em 1.25em;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre;
}
[data-cms-rich-text] pre code {
  background: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}
[data-cms-rich-text] blockquote {
  border-left: 4px solid rgba(0, 0, 0, 0.15);
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
  opacity: 0.8;
}
[data-cms-rich-text] img {
  max-width: 100%;
  height: auto;
}
`.trim();
function RichTextField({ value, className, prose = false }) {
  if (!value) return null;
  const classes = [prose ? "prose" : "", className].filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ jsx5(
    "div",
    {
      className: classes,
      "data-cms-rich-text": "true",
      dangerouslySetInnerHTML: { __html: value }
    }
  );
}

// src/ui/fields/MediaField.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
var VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];
function isVideoUrl(url) {
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}
function MediaField({ value, className, alt = "", autoPlay = false }) {
  if (!value) return null;
  let src;
  let imgAlt;
  if (typeof value === "string") {
    src = value;
    imgAlt = alt;
  } else if (value && typeof value === "object") {
    const obj = value;
    src = obj.url || obj.src || obj.path || "";
    imgAlt = obj.alt || alt;
  } else {
    return null;
  }
  if (!src) return null;
  if (isVideoUrl(src)) {
    return /* @__PURE__ */ jsx6(
      "video",
      {
        src,
        controls: !autoPlay,
        autoPlay,
        muted: autoPlay,
        loop: autoPlay,
        playsInline: true,
        className
      }
    );
  }
  return /* @__PURE__ */ jsx6(
    "img",
    {
      src,
      alt: imgAlt,
      className
    }
  );
}

// src/ui/forms/CmsForm.tsx
import React, { useState as useState2, useEffect as useEffect2, useCallback } from "react";

// src/ui/forms/DefaultFormField.tsx
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
function DefaultFormField({
  field,
  value,
  onChange,
  error,
  inputClassName,
  labelClassName,
  fieldClassName,
  errorClassName
}) {
  const fieldId = `form-field-${field.name}`;
  const errorId = `${fieldId}-error`;
  const isRequired = field.validation?.required ?? false;
  const hasError = !!error;
  const commonInputProps = {
    id: fieldId,
    name: field.name,
    className: inputClassName,
    required: isRequired,
    "aria-invalid": hasError ? true : void 0,
    "aria-describedby": hasError ? errorId : void 0
  };
  let input;
  switch (field.type) {
    case "textarea":
      input = /* @__PURE__ */ jsx7(
        "textarea",
        {
          ...commonInputProps,
          rows: 4,
          placeholder: field.placeholder,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value)
        }
      );
      break;
    case "checkbox":
      input = /* @__PURE__ */ jsxs3("label", { className: labelClassName, style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
        /* @__PURE__ */ jsx7(
          "input",
          {
            ...commonInputProps,
            type: "checkbox",
            checked: value === true,
            onChange: (e) => onChange(e.target.checked)
          }
        ),
        /* @__PURE__ */ jsx7("span", { children: field.label }),
        isRequired && /* @__PURE__ */ jsx7("span", { "aria-hidden": "true", children: " *" })
      ] });
      break;
    case "select":
      input = /* @__PURE__ */ jsxs3(
        "select",
        {
          ...commonInputProps,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value),
          children: [
            /* @__PURE__ */ jsx7("option", { value: "", children: field.placeholder || "Select..." }),
            field.options?.map((opt) => /* @__PURE__ */ jsx7("option", { value: opt.value, children: opt.label }, opt.value))
          ]
        }
      );
      break;
    case "radio":
      input = /* @__PURE__ */ jsx7("div", { role: "radiogroup", "aria-labelledby": `${fieldId}-label`, children: field.options?.map((opt) => /* @__PURE__ */ jsxs3("label", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
        /* @__PURE__ */ jsx7(
          "input",
          {
            type: "radio",
            name: field.name,
            value: opt.value,
            checked: value === opt.value,
            onChange: () => onChange(opt.value),
            required: isRequired,
            "aria-invalid": hasError ? true : void 0
          }
        ),
        /* @__PURE__ */ jsx7("span", { children: opt.label })
      ] }, opt.value)) });
      break;
    case "number":
      input = /* @__PURE__ */ jsx7(
        "input",
        {
          ...commonInputProps,
          type: "number",
          placeholder: field.placeholder,
          min: field.validation?.min,
          max: field.validation?.max,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value)
        }
      );
      break;
    case "phone":
      input = /* @__PURE__ */ jsx7(
        "input",
        {
          ...commonInputProps,
          type: "tel",
          placeholder: field.placeholder,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value)
        }
      );
      break;
    case "email":
      input = /* @__PURE__ */ jsx7(
        "input",
        {
          ...commonInputProps,
          type: "email",
          placeholder: field.placeholder,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value)
        }
      );
      break;
    case "date":
      input = /* @__PURE__ */ jsx7(
        "input",
        {
          ...commonInputProps,
          type: "date",
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value)
        }
      );
      break;
    default:
      input = /* @__PURE__ */ jsx7(
        "input",
        {
          ...commonInputProps,
          type: "text",
          placeholder: field.placeholder,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value)
        }
      );
      break;
  }
  return /* @__PURE__ */ jsxs3("div", { className: fieldClassName, children: [
    field.type !== "checkbox" && /* @__PURE__ */ jsxs3("label", { id: `${fieldId}-label`, htmlFor: fieldId, className: labelClassName, children: [
      field.label,
      isRequired && /* @__PURE__ */ jsx7("span", { "aria-hidden": "true", children: " *" })
    ] }),
    input,
    hasError && /* @__PURE__ */ jsx7("div", { id: errorId, role: "alert", className: errorClassName, children: error })
  ] });
}

// src/ui/forms/validation.ts
function validateFormData(fields, data) {
  const errors = {};
  for (const field of fields) {
    const value = data[field.name];
    const validation = field.validation;
    const isRequired = validation?.required ?? false;
    if (isRequired) {
      if (field.type === "checkbox") {
        if (value !== true) {
          errors[field.name] = `${field.label} is required`;
          continue;
        }
      } else {
        if (value === void 0 || value === null || String(value).trim() === "") {
          errors[field.name] = `${field.label} is required`;
          continue;
        }
      }
    }
    if (field.type === "checkbox") {
      continue;
    }
    const strValue = String(value ?? "");
    if (strValue.trim() === "") {
      continue;
    }
    switch (field.type) {
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) {
          errors[field.name] = "Please enter a valid email address";
        }
        break;
      }
      case "number": {
        if (isNaN(Number(strValue))) {
          errors[field.name] = "Please enter a valid number";
          break;
        }
        const num = Number(strValue);
        if (validation?.min !== void 0 && num < validation.min) {
          errors[field.name] = `Must be at least ${validation.min}`;
          break;
        }
        if (validation?.max !== void 0 && num > validation.max) {
          errors[field.name] = `Must be at most ${validation.max}`;
          break;
        }
        break;
      }
      case "date": {
        if (isNaN(Date.parse(strValue))) {
          errors[field.name] = "Please enter a valid date";
        }
        break;
      }
      case "select":
      case "radio": {
        if (field.options && field.options.length > 0) {
          const validValues = field.options.map((o) => o.value);
          if (!validValues.includes(strValue)) {
            errors[field.name] = "Please select a valid option";
          }
        }
        break;
      }
    }
    if (errors[field.name]) {
      continue;
    }
    if (field.type !== "number") {
      if (validation?.min !== void 0 && strValue.length < validation.min) {
        errors[field.name] = `Must be at least ${validation.min} characters`;
      } else if (validation?.max !== void 0 && strValue.length > validation.max) {
        errors[field.name] = `Must be at most ${validation.max} characters`;
      }
    }
    if (!errors[field.name] && validation?.regex) {
      try {
        const regex = new RegExp(validation.regex);
        if (!regex.test(strValue)) {
          errors[field.name] = `${field.label} format is invalid`;
        }
      } catch {
      }
    }
  }
  return errors;
}

// src/ui/forms/CmsForm.tsx
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function buildInitialData(form) {
  const data = {};
  for (const field of form.fields) {
    data[field.name] = field.type === "checkbox" ? false : "";
  }
  return data;
}
function CmsForm({
  slug,
  client,
  form: formProp,
  className,
  fieldClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  buttonClassName,
  successClassName,
  errorContainerClassName,
  loadingClassName,
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  loadingContent,
  successContent,
  errorContent,
  renderField,
  onSuccess,
  onError,
  onLoadError,
  resetOnSuccess = true,
  children
}) {
  const [formDef, setFormDef] = useState2(formProp ?? null);
  const [formData, setFormData] = useState2(
    () => formProp ? buildInitialData(formProp) : {}
  );
  const [errors, setErrors] = useState2({});
  const [status, setStatus] = useState2(
    formProp ? "idle" : "loading"
  );
  const [resultMessage, setResultMessage] = useState2("");
  useEffect2(() => {
    if (formProp || !slug || !client) return;
    let cancelled = false;
    setStatus("loading");
    client.getForm(slug).then((form) => {
      if (cancelled) return;
      setFormDef(form);
      setFormData(buildInitialData(form));
      setStatus("idle");
    }).catch((err) => {
      if (cancelled) return;
      setStatus("error");
      setResultMessage(err instanceof Error ? err.message : "Failed to load form");
      onLoadError?.(err instanceof Error ? err : new Error(String(err)));
    });
    return () => {
      cancelled = true;
    };
  }, [slug, client, formProp, onLoadError]);
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formDef || !client) return;
      const validationErrors = validateFormData(formDef.fields, formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setStatus("submitting");
      try {
        const response = await client.submitForm(formDef.slug, formData);
        setStatus("success");
        setResultMessage(response.message || formDef.success_message || "Form submitted successfully");
        onSuccess?.(response);
        if (resetOnSuccess) {
          setFormData(buildInitialData(formDef));
        }
      } catch (err) {
        setStatus("error");
        const errorMsg = err instanceof Error ? err.message : "Failed to submit form";
        setResultMessage(errorMsg);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [formDef, client, formData, onSuccess, onError, resetOnSuccess]
  );
  if (status === "loading") {
    if (loadingContent) {
      return /* @__PURE__ */ jsx8("div", { className: loadingClassName, children: loadingContent });
    }
    return /* @__PURE__ */ jsx8("div", { className: loadingClassName, children: "Loading form..." });
  }
  if (status === "error" && !formDef) {
    if (errorContent) {
      return /* @__PURE__ */ jsx8("div", { className: errorContainerClassName, children: errorContent });
    }
    return /* @__PURE__ */ jsx8("div", { className: errorContainerClassName, role: "alert", children: resultMessage || "Failed to load form" });
  }
  if (!formDef) return null;
  if (status === "success") {
    if (successContent) {
      return /* @__PURE__ */ jsx8("div", { className: successClassName, children: successContent });
    }
    return /* @__PURE__ */ jsx8("div", { className: successClassName, role: "status", children: resultMessage });
  }
  return /* @__PURE__ */ jsxs4("form", { onSubmit: handleSubmit, className, noValidate: true, children: [
    formDef.fields.map((field) => {
      const fieldValue = formData[field.name] ?? (field.type === "checkbox" ? false : "");
      const fieldError = errors[field.name];
      if (renderField) {
        return /* @__PURE__ */ jsx8(React.Fragment, { children: renderField({
          field,
          value: fieldValue,
          onChange: (val) => handleFieldChange(field.name, val),
          error: fieldError,
          inputClassName,
          labelClassName,
          fieldClassName,
          errorClassName
        }) }, field.name);
      }
      return /* @__PURE__ */ jsx8(
        DefaultFormField,
        {
          field,
          value: fieldValue,
          onChange: (val) => handleFieldChange(field.name, val),
          error: fieldError,
          inputClassName,
          labelClassName,
          fieldClassName,
          errorClassName
        },
        field.name
      );
    }),
    children,
    status === "error" && resultMessage && /* @__PURE__ */ jsx8("div", { className: errorContainerClassName, role: "alert", children: resultMessage }),
    /* @__PURE__ */ jsx8(
      "button",
      {
        type: "submit",
        className: buttonClassName,
        disabled: status === "submitting",
        children: status === "submitting" ? submittingLabel : submitLabel
      }
    )
  ] });
}
export {
  CmsBlock,
  CmsForm,
  CmsPage,
  CmsPreviewListener,
  DefaultFormField,
  MediaField,
  RICH_TEXT_BASE_CSS,
  RichTextField,
  TextField,
  defineBlock,
  getRegisteredSchemas,
  registerBlockRenderer,
  unregisterBlockRenderer,
  validateFormData
};
