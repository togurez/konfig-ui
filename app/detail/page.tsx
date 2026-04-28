"use client";

import { SETTINGS } from "@/lib/data";
import { TypeBadge, KeyCell, ValueCell, Toggle, Check, Btn } from "@/components/Atoms";

export default function DetailPage() {
  const focusKey = "integrations.slack.webhook";
  const rows = SETTINGS.slice(0, 6);

  return (
    <div className="flex min-h-[calc(100vh-49px)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-line-2">
          <div className="font-sketch text-[22px] text-text">
            Settings <span className="text-text-dim text-[14px] font-mono ml-2.5">13 keys</span>
          </div>
          <div className="ml-auto">
            <Btn variant="primary">+ New setting</Btn>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px_80px] gap-3.5 px-2 py-2 border-b border-solid border-line font-mono text-[10.5px] text-text-faint tracking-wider uppercase">
            <span><Check /></span>
            <span>Key</span>
            <span>Type</span>
            <span>Value</span>
            <span>Active</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>
          {rows.map((s) => (
            <div
              key={s.key}
              className={`grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px_80px] gap-3.5 px-2 py-2.5 border-b border-dashed border-line-2 items-center font-mono text-[12px] ${
                s.key === focusKey ? "accent-bg" : ""
              }`}
            >
              <Check />
              <span>
                <KeyCell k={s.key} />
                {s.desc && <div className="text-text-dim text-[11.5px] font-ui mt-0.5">{s.desc}</div>}
              </span>
              <span><TypeBadge t={s.type} /></span>
              <span><ValueCell v={s.value} /></span>
              <span><Toggle on={s.active} /></span>
              <span className="text-text-dim">{s.updated}</span>
              <span className="text-text-faint font-mono text-[11px]">view ⋯</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="w-[420px] shrink-0 bg-bg border-l border-dashed border-line-2 flex flex-col font-mono">
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-dashed border-line-2">
          <div className="font-sketch text-[20px] text-text">Detail</div>
          <span className="ml-auto text-text-faint text-[11px]">j ↓ · k ↑ · e edit · ⌫ delete</span>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3.5">
          <Field label="Key">
            <div className="flex items-center gap-2 bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 text-[12px]">
              <KeyCell k="integrations.slack.webhook" />
              <span className="ml-auto text-text-faint text-[11px]">copy ⎘</span>
            </div>
          </Field>

          <div className="flex gap-2.5">
            <Field label="Type">
              <div className="py-1.5"><TypeBadge t="integration" /></div>
            </Field>
            <Field label="Status">
              <div className="py-1.5 flex items-center gap-2">
                <Toggle on />
                <span className="text-accent text-[11px]">active</span>
              </div>
            </Field>
          </div>

          <Field label={<>Value <span className="normal-case tracking-normal text-text-faint">· JSONB</span></>}>
            <div className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 font-mono text-[12px] min-h-[110px] leading-[1.55]">
              <div>
                <span className="text-text-faint inline-block w-[18px] text-right mr-2.5">1</span>
                <span className="text-text-faint">{"{"}</span>
              </div>
              <div>
                <span className="text-text-faint inline-block w-[18px] text-right mr-2.5">2</span>
                {"  "}<span className="text-accent">&quot;url&quot;</span>
                <span className="text-text-faint">:</span>{" "}
                <span className="text-teal-300">&quot;https://hooks.slack.com/services/T01…&quot;</span>
                <span className="text-text-faint">,</span>
              </div>
              <div>
                <span className="text-text-faint inline-block w-[18px] text-right mr-2.5">3</span>
                {"  "}<span className="text-accent">&quot;channel&quot;</span>
                <span className="text-text-faint">:</span>{" "}
                <span className="text-teal-300">&quot;#alerts&quot;</span>
              </div>
              <div>
                <span className="text-text-faint inline-block w-[18px] text-right mr-2.5">4</span>
                <span className="text-text-faint">{"}"}</span>
              </div>
            </div>
          </Field>

          <Field label="Description">
            <div className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 text-[12px] font-ui text-text">
              Production alerts webhook
            </div>
          </Field>

          <Field label="Audit">
            <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1.5 text-[11.5px] text-text-dim">
              <span className="text-text-faint">created</span>
              <span>2026-02-14 09:12 UTC</span>
              <span className="text-text-faint">updated</span>
              <span>1h ago <span className="text-text-faint">(22 revisions)</span></span>
              <span className="text-text-faint">curl</span>
              <span className="text-accent-dim">GET /settings/integrations.slack.webhook</span>
            </div>
          </Field>
        </div>
        <div className="flex gap-2 px-4 py-3.5 border-t border-dashed border-line-2">
          <Btn variant="danger">Delete</Btn>
          <span className="flex-1" />
          <Btn>Copy JSON</Btn>
          <Btn variant="primary">Edit ✎</Btn>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[10.5px] tracking-wider uppercase text-text-faint">{label}</label>
      {children}
    </div>
  );
}
