"use client";

import { useState, useEffect } from "react";
import { Btn, Toggle } from "@/components/Atoms";
import { createSetting, updateSetting, deleteSetting } from "@/lib/api";
import { fromApi, type Setting, type SettingType } from "@/lib/data";

const TYPES: SettingType[] = ["feature_flag", "limit", "appearance", "integration", "custom"];

interface Props {
  setting: Setting | null;
  onClose?: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function EditDrawer({ setting, onClose, onSaved, onDeleted }: Props) {
  const isNew = setting === null;

  const [key, setKey] = useState(setting?.key ?? "");
  const [type, setType] = useState<SettingType>(setting?.type ?? "feature_flag");
  const [valueRaw, setValueRaw] = useState(
    setting ? JSON.stringify(setting.value, null, 2) : ""
  );
  const [desc, setDesc] = useState(setting?.desc ?? "");
  const [active, setActive] = useState(setting?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKey(setting?.key ?? "");
    setType(setting?.type ?? "feature_flag");
    setValueRaw(setting ? JSON.stringify(setting.value, null, 2) : "");
    setDesc(setting?.desc ?? "");
    setActive(setting?.active ?? true);
    setError(null);
  }, [setting]);

  const handleSave = async () => {
    let value: unknown;
    try {
      value = JSON.parse(valueRaw);
    } catch {
      setError("Value is not valid JSON");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createSetting({
          key,
          setting_type: type,
          value,
          description: desc || undefined,
          is_active: active,
        });
      } else {
        await updateSetting(setting.key, {
          setting_type: type,
          value,
          description: desc || undefined,
          is_active: active,
        });
      }
      onSaved?.();
      if (isNew) onClose?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!setting) return;
    if (!confirm(`Delete "${setting.key}"?`)) return;
    setSaving(true);
    try {
      await deleteSetting(setting.key);
      onDeleted?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setSaving(false);
    }
  };

  return (
    <aside className="w-[420px] shrink-0 bg-bg border-l border-dashed border-line-2 flex flex-col font-mono">
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-dashed border-line-2">
        <div className="font-sketch text-[20px] text-text">{isNew ? "New setting" : "Edit setting"}</div>
        <button onClick={onClose} className="ml-auto text-text-faint font-mono text-[12px] hover:text-text">
          Esc ✕
        </button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-auto">
        <Field label="Key" hint="dot-notation · unique · cannot change after create">
          {isNew ? (
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. feature.my_flag"
              className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 font-mono text-[12px] text-text w-full outline-none focus:border-accent"
            />
          ) : (
            <div className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 font-mono text-[12px] text-text">
              {key}
            </div>
          )}
        </Field>

        <Field label="Type">
          <Seg options={TYPES} active={type} onSelect={(v) => setType(v as SettingType)} />
        </Field>

        <Field label="Value" hint="valid JSON · string values must be quoted">
          <textarea
            value={valueRaw}
            onChange={(e) => setValueRaw(e.target.value)}
            rows={5}
            className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 font-mono text-[12px] text-text w-full outline-none focus:border-accent resize-y"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 text-[12px] font-ui text-text w-full outline-none focus:border-accent resize-none"
          />
        </Field>

        <div className="flex items-center gap-2.5 pt-1">
          <button onClick={() => setActive((v) => !v)}>
            <Toggle on={active} />
          </button>
          <span className="text-text text-[12px]">Active</span>
          {!isNew && (
            <span className="ml-auto text-text-faint text-[10.5px]">updated {setting.updated}</span>
          )}
        </div>

        {error && (
          <div className="text-red-400 text-[11.5px] font-mono border border-dashed border-red-400/40 rounded-[3px] px-2.5 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-2 px-4 py-3.5 border-t border-dashed border-line-2">
        {!isNew && <Btn variant="danger" onClick={handleDelete} disabled={saving}>Delete</Btn>}
        <span className="flex-1" />
        <Btn onClick={onClose} disabled={saving}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save ⌘↩"}
        </Btn>
      </div>
    </aside>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] tracking-wider uppercase text-text-faint">{label}</label>
      {children}
      {hint && <span className="text-[10.5px] text-text-faint font-mono">{hint}</span>}
    </div>
  );
}

function Seg({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="inline-flex border border-dashed border-line rounded-[3px] overflow-hidden font-mono text-[11px]">
      {options.map((o, i) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={`px-2.5 py-1.5 ${i < options.length - 1 ? "border-r border-dashed border-line" : ""} ${
            o === active ? "accent-bg text-accent" : "text-text-dim hover:text-text"
          }`}
        >
          {o === active ? "● " : ""}
          {o}
        </button>
      ))}
    </div>
  );
}
