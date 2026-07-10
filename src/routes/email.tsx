import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { generateEmail } from "@/lib/ai.functions";
import { buildEmailPrompt, type EmailInput } from "@/lib/prompts";
import { useSession } from "@/lib/session-store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Youth Career Launchpad" },
      {
        name: "description",
        content:
          "Generate professional workplace emails tuned for South African job seekers, in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

const templates = [
  { label: "Cover Letter", context: "Cover letter for a job application" },
  { label: "Recruiter Follow-up", context: "Following up with a recruiter after applying" },
  { label: "Thank You Email", context: "Thank you email after a job interview" },
  { label: "Internship Application", context: "Applying for an internship opportunity" },
  { label: "Job Application", context: "Applying for a full-time role" },
  { label: "Networking", context: "Cold networking outreach to a professional" },
];

const audiences = ["Recruiter", "Hiring Manager", "HR", "Company"];
const tones = ["Formal", "Professional", "Persuasive", "Friendly", "Informal"];

function EmailPage() {
  const [form, setForm] = useState<EmailInput>({
    jobTitle: "",
    company: "",
    context: "",
    audience: "Recruiter",
    tone: "Professional",
    notes: "",
  });
  const [output, setOutput] = useState("");
  const logActivity = useSession((s) => s.logActivity);

  const prompt = useMemo(() => buildEmailPrompt(form), [form]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await generateEmail({ data: form });
      return res.text;
    },
    onSuccess: (text) => {
      setOutput(text);
      logActivity({ type: "email", title: `Email: ${form.context || "Generated email"}` });
      toast.success("Email ready — edit it before sending.");
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error("Unable to generate", { description: msg });
    },
  });

  const update = <K extends keyof EmailInput>(k: K, v: EmailInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canGenerate = form.context.trim().length > 0 && !mutation.isPending;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Craft professional workplace emails tailored to your audience and tone."
      />

      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <Button
            key={t.label}
            variant="outline"
            size="sm"
            className="rounded-full border-border bg-card"
            onClick={() => update("context", t.context)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl border-border shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Email details</CardTitle>
            <CardDescription>Give the AI enough context for a great draft.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Job Title">
              <Input
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                placeholder="e.g. Junior Data Analyst"
              />
            </Field>
            <Field label="Company Name">
              <Input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="e.g. Sasol"
              />
            </Field>
            <Field label="Email Context">
              <Input
                value={form.context}
                onChange={(e) => update("context", e.target.value)}
                placeholder="e.g. Follow up after my interview"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Audience">
                <Select value={form.audience} onValueChange={(v) => update("audience", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tone">
                <Select value={form.tone} onValueChange={(v) => update("tone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Additional Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Anything specific to include…"
                rows={3}
              />
            </Field>

            <PromptPreview prompt={prompt} />

            <Button
              onClick={() => mutation.mutate()}
              disabled={!canGenerate}
              size="lg"
              className="mt-2 gap-2"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating your email…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Email</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-soft lg:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="font-display text-lg">Draft</CardTitle>
              <CardDescription>Edit freely before sending.</CardDescription>
            </div>
            {output && <Badge variant="secondary" className="rounded-full">Editable</Badge>}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {output ? (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    className="min-h-[420px] resize-y rounded-xl bg-background font-mono text-sm leading-relaxed"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center"
                >
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                      <Mail className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium">Generate your first professional email</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fill in the context and hit Generate.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {output && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={copy} className="gap-1">
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={download} className="gap-1">
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                  className="gap-1"
                >
                  <RefreshCw className={`h-4 w-4 ${mutation.isPending ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function PromptPreview({ prompt }: { prompt: string }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground transition hover:bg-muted/60">
        <span className="font-medium">Preview AI prompt</span>
        <ChevronDown className="h-3.5 w-3.5 transition group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {prompt}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
