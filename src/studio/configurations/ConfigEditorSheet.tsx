import React from "react";
import { Loader2, Save, X } from "lucide-react";
import { api } from "../../lib/api";
import type {
  ConfigurationCreate,
  ConfigurationKind,
  ConfigurationRead,
  CustomEntityRead,
  PatternRead,
  TransformationMode,
} from "../../lib/types";
import { Button, CheckboxField, FormField, Input, Select, Textarea } from "../../components/common/UI";

type ConfigEditorMode = "create" | "edit";

type ConfigFormState = {
  kind: ConfigurationKind;
  name: string;
  description: string;
  category: string;
  tags: string;
  isActive: boolean;
  selectedPatternIds: string[];
  selectedEntityIds: string[];
  textMode: TransformationMode;
  textSemanticLabel: string;
  imageMode: TransformationMode;
  imageBlurRadius: string;
};

function splitTags(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
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

function defaultForm(): ConfigFormState {
  return {
    kind: "pack",
    name: "",
    description: "",
    category: "",
    tags: "",
    isActive: true,
    selectedPatternIds: [],
    selectedEntityIds: [],
    textMode: "semantic",
    textSemanticLabel: "SENSITIVE_VALUE",
    imageMode: "blur",
    imageBlurRadius: "5",
  };
}

function validate(form: ConfigFormState) {
  if (!form.name.trim()) return "Configuration name is required.";
  if (form.selectedPatternIds.length === 0 && form.selectedEntityIds.length === 0) {
    return "Select at least one pattern or one custom entity.";
  }
  return null;
}

interface ConfigEditorSheetProps {
  open: boolean;
  mode: ConfigEditorMode;
  configId?: string | null;
  onClose: () => void;
  onSaved: (config: ConfigurationRead) => Promise<void> | void;
}

export default function ConfigEditorSheet({ open, mode, configId, onClose, onSaved }: ConfigEditorSheetProps) {
  const [form, setForm] = React.useState<ConfigFormState>(defaultForm);
  const [patterns, setPatterns] = React.useState<PatternRead[]>([]);
  const [entities, setEntities] = React.useState<CustomEntityRead[]>([]);
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
    setLoading(true);

    async function loadData() {
      try {
        const [patternsRes, entitiesRes] = await Promise.all([
          api.listPatterns({ page: 1, page_size: 200 }, controller.signal),
          api.listEntities({ page: 1, page_size: 200 }, controller.signal),
        ]);

        setPatterns(patternsRes.data);
        setEntities(entitiesRes.data);

        if (mode === "create") {
          setForm(defaultForm());
          return;
        }

        if (!configId) {
          setError("Configuration ID is missing.");
          return;
        }

        const config = await api.getConfiguration(configId, controller.signal);
        setForm({
          kind: config.kind,
          name: config.name,
          description: config.description ?? "",
          category: config.category ?? "",
          tags: (config.tags ?? []).join(", "),
          isActive: config.is_active ?? true,
          selectedPatternIds: config.pattern_ids ?? [],
          selectedEntityIds: config.custom_entity_ids ?? [],
          textMode: config.default_text_transformation?.mode ?? "semantic",
          textSemanticLabel: config.default_text_transformation?.semantic_label ?? "SENSITIVE_VALUE",
          imageMode: config.default_image_transformation?.mode ?? "blur",
          imageBlurRadius:
            config.default_image_transformation?.blur_radius !== undefined
              ? String(config.default_image_transformation.blur_radius)
              : "5",
        });
      } catch (err) {
        if (!(err instanceof Error) || err.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Failed to load configuration editor data.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadData();
    return () => controller.abort();
  }, [open, mode, configId]);

  const validationError = validate(form);

  const togglePattern = React.useCallback((id: string) => {
    setForm((current) => ({
      ...current,
      selectedPatternIds: current.selectedPatternIds.includes(id)
        ? current.selectedPatternIds.filter((item) => item !== id)
        : [...current.selectedPatternIds, id],
    }));
  }, []);

  const toggleEntity = React.useCallback((id: string) => {
    setForm((current) => ({
      ...current,
      selectedEntityIds: current.selectedEntityIds.includes(id)
        ? current.selectedEntityIds.filter((item) => item !== id)
        : [...current.selectedEntityIds, id],
    }));
  }, []);

  const submit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (validationError) {
        setError(validationError);
        return;
      }

      const payload: ConfigurationCreate = {
        kind: form.kind,
        name: form.name.trim(),
        description: maybeText(form.description) ?? null,
        category: maybeText(form.category) ?? null,
        tags: splitTags(form.tags),
        is_active: form.isActive,
        pattern_ids: form.selectedPatternIds,
        custom_entity_ids: form.selectedEntityIds,
        default_text_transformation: {
          mode: form.textMode,
          semantic_label: form.textMode === "semantic" ? maybeText(form.textSemanticLabel) ?? "SENSITIVE_VALUE" : undefined,
        },
        default_image_transformation: {
          mode: form.imageMode,
          blur_radius: form.imageMode === "blur" ? maybeNumber(form.imageBlurRadius) ?? 5 : undefined,
        },
      };

      setSaving(true);
      setError(null);

      try {
        const saved = mode === "create" ? await api.createConfiguration(payload) : await api.updateConfiguration(configId ?? "", payload);
        await onSaved(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save configuration.");
      } finally {
        setSaving(false);
      }
    },
    [configId, form, mode, onSaved, validationError],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/25 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-3xl flex-col border-l border-stone-200 bg-stone-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "New configuration" : "Edit configuration"}
      >
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{mode === "create" ? "New configuration" : "Edit configuration"}</h2>
            <p className="mt-1 text-xs text-stone-500">Bundle patterns and entities into reusable packs, profiles, or presets.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close configuration editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading configuration data...
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {error ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Configuration details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Kind">
                    <Select value={form.kind} onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value as ConfigurationKind }))}>
                      <option value="pack">Pack</option>
                      <option value="profile">Profile</option>
                      <option value="preset">Preset</option>
                    </Select>
                  </FormField>
                  <FormField label="Name">
                    <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Customer Support Pack" />
                  </FormField>
                  <FormField label="Category">
                    <Input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="support" />
                  </FormField>
                  <FormField label="Tags">
                    <Input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="customer, pii" />
                  </FormField>
                  <FormField label="Description" className="sm:col-span-2">
                    <Textarea rows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                  </FormField>
                </div>
                <CheckboxField label="Configuration is active" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
              </section>

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Pattern and entity selection</p>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="mb-3 text-xs font-medium text-stone-500">Patterns ({form.selectedPatternIds.length})</p>
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {patterns.length === 0 ? <p className="text-xs text-stone-400">No patterns found.</p> : null}
                      {patterns.map((pattern) => (
                        <CheckboxField
                          key={pattern.id}
                          label={<span className="text-xs">{pattern.name}</span>}
                          checked={form.selectedPatternIds.includes(pattern.id)}
                          onChange={() => togglePattern(pattern.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="mb-3 text-xs font-medium text-stone-500">Custom entities ({form.selectedEntityIds.length})</p>
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {entities.length === 0 ? <p className="text-xs text-stone-400">No custom entities found.</p> : null}
                      {entities.map((entity) => (
                        <CheckboxField
                          key={entity.id}
                          label={<span className="text-xs">{entity.name}</span>}
                          checked={form.selectedEntityIds.includes(entity.id)}
                          onChange={() => toggleEntity(entity.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Default transformation behavior</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Default text mode">
                    <Select value={form.textMode} onChange={(event) => setForm((prev) => ({ ...prev, textMode: event.target.value as TransformationMode }))}>
                      <option value="semantic">Semantic label</option>
                      <option value="generic">Generic placeholder</option>
                      <option value="mask">Mask</option>
                      <option value="partial_mask">Partial mask</option>
                      <option value="stable_alias">Stable alias</option>
                      <option value="custom">Custom placeholder</option>
                    </Select>
                  </FormField>
                  <FormField label="Default image mode">
                    <Select value={form.imageMode} onChange={(event) => setForm((prev) => ({ ...prev, imageMode: event.target.value as TransformationMode }))}>
                      <option value="blur">Blur</option>
                      <option value="pixelate">Pixelate</option>
                      <option value="overlay">Overlay</option>
                    </Select>
                  </FormField>

                  {form.textMode === "semantic" ? (
                    <FormField label="Text semantic label" className="sm:col-span-2">
                      <Input value={form.textSemanticLabel} onChange={(event) => setForm((prev) => ({ ...prev, textSemanticLabel: event.target.value }))} placeholder="SENSITIVE_VALUE" />
                    </FormField>
                  ) : null}

                  {form.imageMode === "blur" ? (
                    <FormField label="Image blur radius" className="sm:col-span-2">
                      <Input type="number" min={1} value={form.imageBlurRadius} onChange={(event) => setForm((prev) => ({ ...prev, imageBlurRadius: event.target.value }))} />
                    </FormField>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-200 bg-white px-6 py-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={saving} disabled={loading}>
                {!saving ? <Save className="mr-2 h-4 w-4" /> : null}
                {mode === "create" ? "Create configuration" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
