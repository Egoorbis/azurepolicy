"use client";

import { useMemo, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function Home() {
  const appName =
    process.env.NEXT_PUBLIC_APP_NAME || "CIS Benchmark Validation Portal";
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const canSubmit = useMemo(
    () => !!file && status !== "uploading",
    [file, status],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage("Select a CIS XLSX file before uploading.");
      setStatus("error");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setMessage("File too large. Please keep uploads under 25 MB.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading and queueing parse job...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }
      setStatus("success");
      setMessage("Uploaded. Parse job queued.");
      setFile(null);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-3">
          <p className="text-sm font-medium text-blue-700">
            Managed Identity • Entra ID • CIS
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{appName}</h1>
          <p className="text-base text-slate-600">
            Upload CIS Benchmarks, assign control owners, track Level 1/2
            validation, and monitor compliance health with secure-by-default
            Azure services.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Upload CIS Benchmark</h2>
                <p className="text-sm text-slate-600">
                  Accepts XLSX from CIS WorkBench. Files are stored privately
                  and a parse job is queued.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              <label
                htmlFor="benchmark"
                className="block text-sm font-medium text-slate-700"
              >
                Benchmark file (XLSX)
              </label>
              <input
                id="benchmark"
                name="benchmark"
                type="file"
                accept=".xlsx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {status === "uploading" ? "Uploading..." : "Upload & Queue"}
                </button>
                <p className="text-xs text-slate-500">
                  Max 25 MB. Stored privately; processed via queue with managed
                  identity.
                </p>
              </div>

              {status !== "idle" && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${
                    status === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : status === "error"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Assignments at a glance</h2>
              <p className="text-sm text-slate-600">
                Track owners and due dates by level.
              </p>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Level 1 controls</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  Pending: 0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Level 2 controls</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                  Pending: 0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Overdue</span>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                  0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                This panel will update once parsing completes and assignments
                are created.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-2">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Compliance overview</h2>
              <p className="text-sm text-slate-600">
                Live compliance scoring will appear once controls are validated.
              </p>
            </div>
            <div className="grid gap-4 px-6 py-6 sm:grid-cols-3">
              <MetricCard label="Overall compliance" value="—" tone="neutral" />
              <MetricCard label="Level 1 compliance" value="—" tone="neutral" />
              <MetricCard label="Level 2 compliance" value="—" tone="neutral" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Security defaults</h2>
              <p className="text-sm text-slate-600">OWASP + MASB aligned.</p>
            </div>
            <ul className="space-y-3 px-6 py-6 text-sm text-slate-700">
              <li>Managed identity for Storage (no keys).</li>
              <li>HTTPS-only, TLS 1.2+, FTPS disabled.</li>
              <li>Private uploads container; queue-based parsing.</li>
              <li>Input size limits; XLSX-only uploads.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

type MetricTone = "neutral" | "good" | "warn" | "bad";

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: MetricTone;
}) {
  const toneClasses: Record<MetricTone, string> = {
    neutral: "bg-slate-50 text-slate-800",
    good: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-rose-50 text-rose-800",
  };
  return (
    <div
      className={`rounded-xl border border-slate-200 p-4 ${toneClasses[tone]}`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
