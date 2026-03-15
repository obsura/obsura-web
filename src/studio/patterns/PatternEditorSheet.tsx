import React from "react";
import { Loader2, Save, Sparkles, X } from "lucide-react";
import { api } from "../../lib/api";
import type {
  MatcherKind,
  PatternCreate,
  PatternRead,
  PatternMatcherDefinition,
  TransformationMode,
  TransformationRule,
} from "../../lib/types";
import { Button, CheckboxField, FormField, Input, Select, Textarea } from "../../components/common/UI";

const transformationModes: Array<{ value: TransformationMode; label: string }> = [
  { value: "semantic", label: "Semantic label" },
  { value: "generic", label: "Generic placeholder" },
  { value: "mask", label: "Mask" },
  { value: "partial_mask", label: "Partial mask" },
  { value: "stable_alias", label: "Stable alias" },
  { value: "custom", label: "Custom placeholder" },
];

type EditorMode = "create" | "edit";

type PatternFormState = {
  name: string;
  description: string;
  category: string;
  tags: string;
  isActive: boolean;
  matcherKind: MatcherKind;
  matcherValue: string;
  matcherValues: string;
  caseSensitive: boolean;
  transformationMode: TransformationMode;
  placeholder: string;
  semanticLabel: string;
  aliasPrefix: string;
  prefixVisible: string;
  suffixVisible: string;
  maskCharacter: string;
};

function emptyFormState(): PatternFormState {
  return {
    name: "",
    description: "",
    category: "",
    tags: "",
    isActive: true,
    matcherKind: "regex",
    matcherValue: "",
    matcherValues: "",
    caseSensitive: false,
    transformationMode: "semantic",
    placeholder: "",
    semanticLabel: "SENSITIVE_VALUE",
    aliasPrefix: "ENTITY",
    prefixVisible: "2",
    suffixVisible: "2",
    maskCharacter: "*",
  };
}

function splitEntries(input: string) {
  return input
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function maybeNumber(input: string) {
  if (!input.trim()) return undefined;
  const value = Number(input);
  return Number.isFinite(value) ? value : undefined;
}

function maybeText(input: string) {
  const value = input.trim();
  return value ? value : undefined;
}

function matcherNeedsList(kind: MatcherKind) {
  return kind === "list" || kind === "deny_list";
}

function matcherValueLabel(kind: MatcherKind) {
  switch (kind) {
    case "regex":
      return "Regex pattern";
    case "exact":
      return "Exact value";
    case "spacy":
      return "spaCy entity label";
    default:
      return "Matcher value";
  }
}

function matcherValueHint(kind: MatcherKind) {
  switch (kind) {
    case "regex":
      return "Example: \\b[A-Z]{3}-\\d{4}\\b";
    case "exact":
      return "Exact string to redact when matched.";
    case "spacy":
      return "Entity label exposed by your backend model, e.g. PERSON or ORG.";
    default:
      return "One value per pattern.";
  }
}

function formStateFromPattern(pattern: PatternRead): PatternFormState {
  const transformation = pattern.transformation ?? { mode: "semantic", semantic_label: "SENSITIVE_VALUE" };

  return {
    name: pattern.name,
    description: pattern.description ?? "",
    category: pattern.category ?? "",
    tags: (pattern.tags ?? []).join(", "),
    isActive: pattern.is_active ?? true,
    matcherKind: pattern.matcher.kind,
    matcherValue: pattern.matcher.value ?? "",
    matcherValues: (pattern.matcher.values ?? []).join("\n"),
    caseSensitive: pattern.matcher.case_sensitive ?? false,
    transformationMode: transformation.mode ?? "semantic",
    placeholder: transformation.placeholder ?? "",
    semanticLabel: transformation.semantic_label ?? "SENSITIVE_VALUE",
    aliasPrefix: transformation.alias_prefix ?? "ENTITY",
    prefixVisible: transformation.prefix_visible !== undefined ? String(transformation.prefix_visible) : "2",
    suffixVisible: transformation.suffix_visible !== undefined ? String(transformation.suffix_visible) : "2",
    maskCharacter: transformation.mask_character ?? "*",
  };
}

function buildTransformation(form: PatternFormState): TransformationRule {
  switch (form.transformationMode) {
    case "generic":
    case "custom":
      return {
        mode: form.transformationMode,
        placeholder: maybeText(form.placeholder),
      };
    case "semantic":
      return {
        mode: "semantic",
        semantic_label: maybeText(form.semanticLabel) ?? "SENSITIVE_VALUE",
      };
    case "mask":
      return {
        mode: "mask",
        mask_character: maybeText(form.maskCharacter) ?? "*",
      };
    case "partial_mask":
      return {
        mode: "partial_mask",
        prefix_visible: maybeNumber(form.prefixVisible) ?? 0,
        suffix_visible: maybeNumber(form.suffixVisible) ?? 0,
        mask_character: maybeText(form.maskCharacter) ?? "*",
      };
    case "stable_alias":
      return {
        mode: "stable_alias",
        alias_prefix: maybeText(form.aliasPrefix) ?? "ENTITY",
      };
    default:
      return { mode: form.transformationMode };
  }
}

function buildMatcher(form: PatternFormState): PatternMatcherDefinition {
  if (matcherNeedsList(form.matcherKind)) {
    return {
      kind: form.matcherKind,
      values: splitEntries(form.matcherValues),
      case_sensitive: form.caseSensitive,
    };
  }

  return {
    kind: form.matcherKind,
    value: maybeText(form.matcherValue),
    case_sensitive: form.caseSensitive,
  };
}

function buildPayload(form: PatternFormState): PatternCreate {
  return {
    name: form.name.trim(),
    description: maybeText(form.description) ?? null,
    category: maybeText(form.category) ?? null,
    tags: splitEntries(form.tags),
    is_active: form.isActive,
    matcher: buildMatcher(form),
    transformation: buildTransformation(form),
  };
}

function validate(form: PatternFormState) {
  if (!form.name.trim()) return "Pattern name is required.";
  if (matcherNeedsList(form.matcherKind) && splitEntries(form.matcherValues).length === 0) {
    return "Add at least one matcher value.";
  }
  if (!matcherNeedsList(form.matcherKind) && !maybeText(form.matcherValue)) {
    return `${matcherValueLabel(form.matcherKind)} is required.`;
  }
  return null;
}

interface PatternEditorSheetProps {
  open: boolean;
  mode: EditorMode;
  patternId?: string | null;
  onClose: () => void;
  onSaved: (pattern: PatternRead) => Promise<void> | void;
}

export default function PatternEditorSheet({ open, mode, patternId, onClose, onSaved }: PatternEditorSheetProps) {
  const [form, setForm] = React.useState<PatternFormState>(emptyFormState);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setError(null);

    if (mode === "create") {
      setForm(emptyFormState());
      setLoading(false);
      return () => controller.abort();
    }

    if (!patternId) {
      setError("Pattern ID is missing.");
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    api
      .getPattern(patternId, controller.signal)
      .then((pattern) => {
        setForm(formStateFromPattern(pattern));
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [open, mode, patternId]);

  const setField = React.useCallback(<K extends keyof PatternFormState>(key: K, value: PatternFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const submitLabel = mode === "create" ? "Create pattern" : "Save changes";
  const title = mode === "create" ? "New pattern" : "Edit pattern";
  const validationError = validate(form);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const payload = buildPayload(form);
        const saved =
          mode === "create"
            ? await api.createPattern(payload)
            : await api.updatePattern(patternId ?? "", payload);

        await onSaved(saved);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save pattern.";
        setError(message);
      } finally {
        setSaving(false);
      }
    },
    [form, mode, onSaved, patternId, validationError],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/25 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col border-l border-stone-200 bg-stone-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
            <p className="mt-1 text-xs text-stone-500">
              Configure the detection matcher and its text transformation behavior.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close pattern editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-3 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading pattern details…
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <section className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Pattern details</p>
                  <p className="mt-1 text-xs text-stone-500">Describe the rule so it is easy to reuse in configurations later.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Name" className="sm:col-span-2">
                    <Input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Employee ID" />
                  </FormField>
                  <FormField label="Category">
                    <Input value={form.category} onChange={(event) => setField("category", event.target.value)} placeholder="internal" />
                  </FormField>
                  <FormField label="Tags">
                    <Input value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="pii, support, compliance" />
                  </FormField>
                  <FormField label="Description" className="sm:col-span-2">
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(event) => setField("description", event.target.value)}
                      placeholder="Redacts internal identifiers that follow the EMP-1234 format."
                    />
                  </FormField>
                </div>
                <CheckboxField
                  label="Pattern is active"
                  checked={form.isActive}
                  onChange={(event) => setField("isActive", event.target.checked)}
                />
              </section>

              <section className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Matcher</p>
                  <p className="mt-1 text-xs text-stone-500">Choose how the backend should detect matching values.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Matcher kind">
                    <Select
                      value={form.matcherKind}
                      onChange={(event) => setField("matcherKind", event.target.value as MatcherKind)}
                    >
                      <option value="regex">Regex</option>
                      <option value="exact">Exact match</option>
                      <option value="list">List match</option>
                      <option value="spacy">spaCy entity</option>
                      <option value="deny_list">Deny list</option>
                    </Select>
                  </FormField>
                  <div className="flex items-end pb-2">
                    <CheckboxField
                      label="Case sensitive"
                      checked={form.caseSensitive}
                      onChange={(event) => setField("caseSensitive", event.target.checked)}
                    />
                  </div>
                  {matcherNeedsList(form.matcherKind) ? (
                    <FormField
                      label="Matcher values"
                      hint="Use commas or line breaks."
                      className="sm:col-span-2"
                    >
                      <Textarea
                        rows={6}
                        value={form.matcherValues}
                        onChange={(event) => setField("matcherValues", event.target.value)}
                        placeholder="Secret Project\nInternal Only\nDo Not Disclose"
                      />
                    </FormField>
                  ) : (
                    <FormField
                      label={matcherValueLabel(form.matcherKind)}
                      hint={matcherValueHint(form.matcherKind)}
                      className="sm:col-span-2"
                    >
                      <Input
                        value={form.matcherValue}
                        onChange={(event) => setField("matcherValue", event.target.value)}
                        placeholder={form.matcherKind === "regex" ? "\\bEMP-\\d{4}\\b" : "PERSON"}
                      />
                    </FormField>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Transformation rule</p>
                    <p className="mt-1 text-xs text-indigo-600">
                      This controls how matches will be rewritten in redacted output.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Transformation mode" className="sm:col-span-2">
                    <Select
                      value={form.transformationMode}
                      onChange={(event) => setField("transformationMode", event.target.value as TransformationMode)}
                    >
                      {transformationModes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  {(form.transformationMode === "generic" || form.transformationMode === "custom") && (
                    <FormField label="Placeholder" className="sm:col-span-2">
                      <Input
                        value={form.placeholder}
                        onChange={(event) => setField("placeholder", event.target.value)}
                        placeholder="[REDACTED]"
                      />
                    </FormField>
                  )}

                  {form.transformationMode === "semantic" && (
                    <FormField label="Semantic label" className="sm:col-span-2">
                      <Input
                        value={form.semanticLabel}
                        onChange={(event) => setField("semanticLabel", event.target.value)}
                        placeholder="EMPLOYEE_ID"
                      />
                    </FormField>
                  )}

                  {form.transformationMode === "stable_alias" && (
                    <FormField label="Alias prefix" className="sm:col-span-2">
                      <Input
                        value={form.aliasPrefix}
                        onChange={(event) => setField("aliasPrefix", event.target.value)}
                        placeholder="CUSTOMER"
                      />
                    </FormField>
                  )}

                  {(form.transformationMode === "mask" || form.transformationMode === "partial_mask") && (
                    <FormField label="Mask character">
                      <Input
                        maxLength={1}
                        value={form.maskCharacter}
                        onChange={(event) => setField("maskCharacter", event.target.value)}
                        placeholder="*"
                      />
                    </FormField>
                  )}

                  {form.transformationMode === "partial_mask" && (
                    <>
                      <FormField label="Visible prefix">
                        <Input
                          type="number"
                          min={0}
                          value={form.prefixVisible}
                          onChange={(event) => setField("prefixVisible", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Visible suffix">
                        <Input
                          type="number"
                          min={0}
                          value={form.suffixVisible}
                          onChange={(event) => setField("suffixVisible", event.target.value)}
                        />
                      </FormField>
                    </>
                  )}
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-4">
              <p className="text-xs text-stone-500">Delete is not exposed by the current API yet, so this phase focuses on create and edit.</p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={saving} disabled={loading}>
                  {!saving ? <Save className="mr-2 h-4 w-4" /> : null}
                  {submitLabel}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
