import React from "react";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { api } from "../../lib/api";
import type {
  CustomEntityCreate,
  CustomEntityRead,
  MatcherKind,
  PatternMatcherDefinition,
  TransformationMode,
  TransformationRule,
} from "../../lib/types";
import { Button, CheckboxField, FormField, Input, Select, Textarea } from "../../components/common/UI";

type EntityEditorMode = "create" | "edit";

type DetectionRow = {
  id: string;
  kind: MatcherKind;
  value: string;
  valuesText: string;
  caseSensitive: boolean;
};

type EntityFormState = {
  name: string;
  description: string;
  category: string;
  tags: string;
  isActive: boolean;
  transformationMode: TransformationMode;
  semanticLabel: string;
  placeholder: string;
  aliasPrefix: string;
  prefixVisible: string;
  suffixVisible: string;
  maskCharacter: string;
};

const transformationModes: Array<{ value: TransformationMode; label: string }> = [
  { value: "semantic", label: "Semantic label" },
  { value: "generic", label: "Generic placeholder" },
  { value: "mask", label: "Mask" },
  { value: "partial_mask", label: "Partial mask" },
  { value: "stable_alias", label: "Stable alias" },
  { value: "custom", label: "Custom placeholder" },
];

function rowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function splitEntries(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function maybeText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function maybeNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function isListKind(kind: MatcherKind) {
  return kind === "list" || kind === "deny_list";
}

function toDetectionRow(definition: PatternMatcherDefinition): DetectionRow {
  return {
    id: rowId(),
    kind: definition.kind,
    value: definition.value ?? "",
    valuesText: (definition.values ?? []).join("\n"),
    caseSensitive: definition.case_sensitive ?? false,
  };
}

function toDefinition(row: DetectionRow): PatternMatcherDefinition {
  if (isListKind(row.kind)) {
    return {
      kind: row.kind,
      values: splitEntries(row.valuesText),
      case_sensitive: row.caseSensitive,
    };
  }

  return {
    kind: row.kind,
    value: maybeText(row.value),
    case_sensitive: row.caseSensitive,
  };
}

function emptyForm(): EntityFormState {
  return {
    name: "",
    description: "",
    category: "",
    tags: "",
    isActive: true,
    transformationMode: "semantic",
    semanticLabel: "SENSITIVE_VALUE",
    placeholder: "",
    aliasPrefix: "ENTITY",
    prefixVisible: "2",
    suffixVisible: "2",
    maskCharacter: "*",
  };
}

function emptyRows(): DetectionRow[] {
  return [
    {
      id: rowId(),
      kind: "regex",
      value: "",
      valuesText: "",
      caseSensitive: false,
    },
  ];
}

function transformationFromForm(form: EntityFormState): TransformationRule {
  switch (form.transformationMode) {
    case "generic":
    case "custom":
      return { mode: form.transformationMode, placeholder: maybeText(form.placeholder) };
    case "semantic":
      return { mode: "semantic", semantic_label: maybeText(form.semanticLabel) ?? "SENSITIVE_VALUE" };
    case "stable_alias":
      return { mode: "stable_alias", alias_prefix: maybeText(form.aliasPrefix) ?? "ENTITY" };
    case "mask":
      return { mode: "mask", mask_character: maybeText(form.maskCharacter) ?? "*" };
    case "partial_mask":
      return {
        mode: "partial_mask",
        prefix_visible: maybeNumber(form.prefixVisible) ?? 0,
        suffix_visible: maybeNumber(form.suffixVisible) ?? 0,
        mask_character: maybeText(form.maskCharacter) ?? "*",
      };
    default:
      return { mode: form.transformationMode };
  }
}

function validate(form: EntityFormState, rows: DetectionRow[]) {
  if (!form.name.trim()) return "Entity name is required.";
  if (rows.length === 0) return "Add at least one detection rule.";

  for (const row of rows) {
    if (isListKind(row.kind) && splitEntries(row.valuesText).length === 0) {
      return "List and deny-list rules need at least one value.";
    }
    if (!isListKind(row.kind) && !maybeText(row.value)) {
      return "Regex, exact and spaCy rules need a matcher value.";
    }
  }

  return null;
}

interface EntityEditorSheetProps {
  open: boolean;
  mode: EntityEditorMode;
  entityId?: string | null;
  onClose: () => void;
  onSaved: (entity: CustomEntityRead) => Promise<void> | void;
}

export default function EntityEditorSheet({ open, mode, entityId, onClose, onSaved }: EntityEditorSheetProps) {
  const [form, setForm] = React.useState<EntityFormState>(emptyForm);
  const [rows, setRows] = React.useState<DetectionRow[]>(emptyRows);
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
      setForm(emptyForm());
      setRows(emptyRows());
      setLoading(false);
      return () => controller.abort();
    }

    if (!entityId) {
      setError("Entity ID is missing.");
      return () => controller.abort();
    }

    setLoading(true);
    api
      .getEntity(entityId, controller.signal)
      .then((entity) => {
        setForm({
          name: entity.name,
          description: entity.description ?? "",
          category: entity.category ?? "",
          tags: (entity.tags ?? []).join(", "),
          isActive: entity.is_active ?? true,
          transformationMode: entity.transformation?.mode ?? "semantic",
          semanticLabel: entity.transformation?.semantic_label ?? "SENSITIVE_VALUE",
          placeholder: entity.transformation?.placeholder ?? "",
          aliasPrefix: entity.transformation?.alias_prefix ?? "ENTITY",
          prefixVisible:
            entity.transformation?.prefix_visible !== undefined ? String(entity.transformation.prefix_visible) : "2",
          suffixVisible:
            entity.transformation?.suffix_visible !== undefined ? String(entity.transformation.suffix_visible) : "2",
          maskCharacter: entity.transformation?.mask_character ?? "*",
        });

        const sourceRows = (entity.detection_definitions ?? []).map(toDetectionRow);
        setRows(sourceRows.length > 0 ? sourceRows : emptyRows());
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [open, mode, entityId]);

  const validationError = validate(form, rows);

  const updateRow = React.useCallback((rowIdValue: string, updater: (row: DetectionRow) => DetectionRow) => {
    setRows((current) => current.map((row) => (row.id === rowIdValue ? updater(row) : row)));
  }, []);

  const submit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (validationError) {
        setError(validationError);
        return;
      }

      const payload: CustomEntityCreate = {
        name: form.name.trim(),
        description: maybeText(form.description) ?? null,
        category: maybeText(form.category) ?? null,
        tags: splitEntries(form.tags),
        is_active: form.isActive,
        detection_definitions: rows.map(toDefinition),
        transformation: transformationFromForm(form),
      };

      setSaving(true);
      setError(null);

      try {
        const saved = mode === "create" ? await api.createEntity(payload) : await api.updateEntity(entityId ?? "", payload);
        await onSaved(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save entity.");
      } finally {
        setSaving(false);
      }
    },
    [entityId, form, mode, onSaved, rows, validationError],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/25 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col border-l border-stone-200 bg-stone-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "New entity" : "Edit entity"}
      >
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{mode === "create" ? "New entity" : "Edit entity"}</h2>
            <p className="mt-1 text-xs text-stone-500">Define one or more detection definitions for this entity.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close entity editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading entity...
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {error ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Entity details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Name" className="sm:col-span-2">
                    <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="EMPLOYEE_ID" />
                  </FormField>
                  <FormField label="Category">
                    <Input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="internal" />
                  </FormField>
                  <FormField label="Tags">
                    <Input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="hr, pii" />
                  </FormField>
                  <FormField label="Description" className="sm:col-span-2">
                    <Textarea rows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                  </FormField>
                </div>
                <CheckboxField label="Entity is active" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Detection rules</p>
                  <Button type="button" size="sm" variant="outline" className="flex items-center gap-1" onClick={() => setRows((current) => [...current, { id: rowId(), kind: "regex", value: "", valuesText: "", caseSensitive: false }])}>
                    <Plus className="h-3.5 w-3.5" /> Add rule
                  </Button>
                </div>

                <div className="space-y-3">
                  {rows.map((row, index) => (
                    <div key={row.id} className="rounded-xl border border-stone-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-stone-500">Rule {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                          className="rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                          disabled={rows.length === 1}
                          title={rows.length === 1 ? "At least one rule is required" : "Remove rule"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField label="Matcher kind">
                          <Select value={row.kind} onChange={(event) => updateRow(row.id, (current) => ({ ...current, kind: event.target.value as MatcherKind }))}>
                            <option value="regex">Regex</option>
                            <option value="exact">Exact match</option>
                            <option value="list">List match</option>
                            <option value="spacy">spaCy entity</option>
                            <option value="deny_list">Deny list</option>
                          </Select>
                        </FormField>
                        <div className="flex items-end pb-2">
                          <CheckboxField label="Case sensitive" checked={row.caseSensitive} onChange={(event) => updateRow(row.id, (current) => ({ ...current, caseSensitive: event.target.checked }))} />
                        </div>
                        {isListKind(row.kind) ? (
                          <FormField label="Values" className="sm:col-span-2" hint="Use commas or line breaks.">
                            <Textarea rows={4} value={row.valuesText} onChange={(event) => updateRow(row.id, (current) => ({ ...current, valuesText: event.target.value }))} />
                          </FormField>
                        ) : (
                          <FormField label="Value" className="sm:col-span-2">
                            <Input value={row.value} onChange={(event) => updateRow(row.id, (current) => ({ ...current, value: event.target.value }))} placeholder={row.kind === "regex" ? "\\bEMP-\\d{4}\\b" : "PERSON"} />
                          </FormField>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Transformation</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Transformation mode" className="sm:col-span-2">
                    <Select value={form.transformationMode} onChange={(event) => setForm((prev) => ({ ...prev, transformationMode: event.target.value as TransformationMode }))}>
                      {transformationModes.map((modeOption) => (
                        <option key={modeOption.value} value={modeOption.value}>{modeOption.label}</option>
                      ))}
                    </Select>
                  </FormField>

                  {(form.transformationMode === "generic" || form.transformationMode === "custom") ? (
                    <FormField label="Placeholder" className="sm:col-span-2">
                      <Input value={form.placeholder} onChange={(event) => setForm((prev) => ({ ...prev, placeholder: event.target.value }))} placeholder="[REDACTED]" />
                    </FormField>
                  ) : null}

                  {form.transformationMode === "semantic" ? (
                    <FormField label="Semantic label" className="sm:col-span-2">
                      <Input value={form.semanticLabel} onChange={(event) => setForm((prev) => ({ ...prev, semanticLabel: event.target.value }))} placeholder="EMPLOYEE_ID" />
                    </FormField>
                  ) : null}

                  {form.transformationMode === "stable_alias" ? (
                    <FormField label="Alias prefix" className="sm:col-span-2">
                      <Input value={form.aliasPrefix} onChange={(event) => setForm((prev) => ({ ...prev, aliasPrefix: event.target.value }))} placeholder="ENTITY" />
                    </FormField>
                  ) : null}

                  {(form.transformationMode === "mask" || form.transformationMode === "partial_mask") ? (
                    <FormField label="Mask character">
                      <Input maxLength={1} value={form.maskCharacter} onChange={(event) => setForm((prev) => ({ ...prev, maskCharacter: event.target.value }))} placeholder="*" />
                    </FormField>
                  ) : null}

                  {form.transformationMode === "partial_mask" ? (
                    <>
                      <FormField label="Visible prefix">
                        <Input type="number" min={0} value={form.prefixVisible} onChange={(event) => setForm((prev) => ({ ...prev, prefixVisible: event.target.value }))} />
                      </FormField>
                      <FormField label="Visible suffix">
                        <Input type="number" min={0} value={form.suffixVisible} onChange={(event) => setForm((prev) => ({ ...prev, suffixVisible: event.target.value }))} />
                      </FormField>
                    </>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-200 bg-white px-6 py-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={saving} disabled={loading}>
                {!saving ? <Save className="mr-2 h-4 w-4" /> : null}
                {mode === "create" ? "Create entity" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
