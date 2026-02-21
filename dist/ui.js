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
var VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];
function isVideoUrl(url) {
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}
function MediaField({ value, className, alt = "" }) {
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
    return /* @__PURE__ */ jsx5(
      "video",
      {
        src,
        controls: true,
        className
      }
    );
  }
  return /* @__PURE__ */ jsx5(
    "img",
    {
      src,
      alt: imgAlt,
      className
    }
  );
}

// src/ui/forms/CmsForm.tsx
import React, { useState, useEffect, useCallback } from "react";

// src/ui/forms/DefaultFormField.tsx
import { jsx as jsx6, jsxs as jsxs2 } from "react/jsx-runtime";
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
      input = /* @__PURE__ */ jsx6(
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
      input = /* @__PURE__ */ jsxs2("label", { className: labelClassName, style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
        /* @__PURE__ */ jsx6(
          "input",
          {
            ...commonInputProps,
            type: "checkbox",
            checked: value === true,
            onChange: (e) => onChange(e.target.checked)
          }
        ),
        /* @__PURE__ */ jsx6("span", { children: field.label }),
        isRequired && /* @__PURE__ */ jsx6("span", { "aria-hidden": "true", children: " *" })
      ] });
      break;
    case "select":
      input = /* @__PURE__ */ jsxs2(
        "select",
        {
          ...commonInputProps,
          value: String(value ?? ""),
          onChange: (e) => onChange(e.target.value),
          children: [
            /* @__PURE__ */ jsx6("option", { value: "", children: field.placeholder || "Select..." }),
            field.options?.map((opt) => /* @__PURE__ */ jsx6("option", { value: opt.value, children: opt.label }, opt.value))
          ]
        }
      );
      break;
    case "radio":
      input = /* @__PURE__ */ jsx6("div", { role: "radiogroup", "aria-labelledby": `${fieldId}-label`, children: field.options?.map((opt) => /* @__PURE__ */ jsxs2("label", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
        /* @__PURE__ */ jsx6(
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
        /* @__PURE__ */ jsx6("span", { children: opt.label })
      ] }, opt.value)) });
      break;
    case "number":
      input = /* @__PURE__ */ jsx6(
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
      input = /* @__PURE__ */ jsx6(
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
      input = /* @__PURE__ */ jsx6(
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
      input = /* @__PURE__ */ jsx6(
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
      input = /* @__PURE__ */ jsx6(
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
  return /* @__PURE__ */ jsxs2("div", { className: fieldClassName, children: [
    field.type !== "checkbox" && /* @__PURE__ */ jsxs2("label", { id: `${fieldId}-label`, htmlFor: fieldId, className: labelClassName, children: [
      field.label,
      isRequired && /* @__PURE__ */ jsx6("span", { "aria-hidden": "true", children: " *" })
    ] }),
    input,
    hasError && /* @__PURE__ */ jsx6("div", { id: errorId, role: "alert", className: errorClassName, children: error })
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
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
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
  const [formDef, setFormDef] = useState(formProp ?? null);
  const [formData, setFormData] = useState(
    () => formProp ? buildInitialData(formProp) : {}
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(
    formProp ? "idle" : "loading"
  );
  const [resultMessage, setResultMessage] = useState("");
  useEffect(() => {
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
      return /* @__PURE__ */ jsx7("div", { className: loadingClassName, children: loadingContent });
    }
    return /* @__PURE__ */ jsx7("div", { className: loadingClassName, children: "Loading form..." });
  }
  if (status === "error" && !formDef) {
    if (errorContent) {
      return /* @__PURE__ */ jsx7("div", { className: errorContainerClassName, children: errorContent });
    }
    return /* @__PURE__ */ jsx7("div", { className: errorContainerClassName, role: "alert", children: resultMessage || "Failed to load form" });
  }
  if (!formDef) return null;
  if (status === "success") {
    if (successContent) {
      return /* @__PURE__ */ jsx7("div", { className: successClassName, children: successContent });
    }
    return /* @__PURE__ */ jsx7("div", { className: successClassName, role: "status", children: resultMessage });
  }
  return /* @__PURE__ */ jsxs3("form", { onSubmit: handleSubmit, className, noValidate: true, children: [
    formDef.fields.map((field) => {
      const fieldValue = formData[field.name] ?? (field.type === "checkbox" ? false : "");
      const fieldError = errors[field.name];
      if (renderField) {
        return /* @__PURE__ */ jsx7(React.Fragment, { children: renderField({
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
      return /* @__PURE__ */ jsx7(
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
    status === "error" && resultMessage && /* @__PURE__ */ jsx7("div", { className: errorContainerClassName, role: "alert", children: resultMessage }),
    /* @__PURE__ */ jsx7(
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
  DefaultFormField,
  MediaField,
  RichTextField,
  TextField,
  registerBlockRenderer,
  unregisterBlockRenderer,
  validateFormData
};
