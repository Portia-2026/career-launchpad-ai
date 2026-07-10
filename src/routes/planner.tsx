import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ListChecks,
  Sparkles,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePlan, type GeneratedPlan } from "@/lib/ai.functions";
import { buildPlanPrompt, type PlanInput } from "@/lib/prompts";
import { useSession } from "@/lib/session-store";
import { Field, PageHeader, PromptPreview } from "./email";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Youth Career Launchpad" },
      {
        name: "description",
        content:
          "Turn a career goal into a prioritised, realistic action plan with AI-generated tasks.",
      },
    ],
  }),
  component: PlannerPage,
});

const goals = [
  "Job Search",
  "Interview Preparation",
  "CV Improvement",
  "Internship Search",
  "Learn New Skills",
];
const priorities = ["low", "medium", "high"] as const;

const useCases = [
  "7-Day Job Search Plan",
  "Interview Preparation Schedule",
  "Internship Application Tracker",
  "CV Improvement Checklist",
  "LinkedIn Profile Optimisation",
];

type Task = GeneratedPlan["tasks"][number] & { done: boolean; id: string };

function PlannerPage() {
  const [form, setForm] = useState<PlanInput>({
    goal: "Job Search",
    deadline: "",
    hoursPerDay: 2,
    priority: "medium",
  });
  const [summary, setSummary] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const logActivity = useSession((s) => s.logActivity);

  const prompt = useMemo(() => buildPlanPrompt(form), [form]);

  const mutation = useMutation({
    mutationFn: async () => generatePlan({ data: form }),
    onSuccess: (plan) => {
      setSummary(plan.summary);
      setTasks(
        plan.tasks.map((t) => ({ ...t, done: false, id: crypto.randomUUID() })),
      );
      logActivity({ type: "plan", title: `Plan: ${form.goal}` });
      toast.success("Plan ready — tweak tasks as you go.");
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error("Unable to create plan", { description: msg });
    },
  });

  const update = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTask = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const asMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# ${form.goal} — Plan`, "", summary, "");
    tasks.forEach((t, i) => {
      lines.push(
        `## ${i + 1}. ${t.name}`,
        `- **Deadline:** ${t.deadline}`,
        `- **Priority:** ${t.priority}`,
        `- **Duration:** ${t.estimatedDuration}`,
        `- **Notes:** ${t.notes}`,
        "",
      );
    });
    return lines.join("\n");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(asMarkdown());
    toast.success("Copied plan as markdown");
  };
  const download = () => {
    const blob = new Blob([asMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        icon={ListChecks}
        title="AI Task Planner"
        description="Break a career goal into prioritised, realistic tasks."
      />

      <div className="flex flex-wrap gap-2">
        {useCases.map((u) => (
          <Badge
            key={u}
            variant="secondary"
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-normal text-muted-foreground"
          >
            {u}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl border-border shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Your goal</CardTitle>
            <CardDescription>The more specific, the better the plan.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Career Goal">
              <Select value={form.goal} onValueChange={(v) => update("goal", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {goals.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Deadline">
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                />
              </Field>
              <Field label="Hours / day">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={form.hoursPerDay}
                  onChange={(e) => update("hoursPerDay", Number(e.target.value) || 1)}
                />
              </Field>
            </div>
            <Field label="Priority Level">
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <PromptPreview prompt={prompt} />

            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              size="lg"
              className="mt-2 gap-2"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating your plan…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Plan</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <AnimatePresence mode="wait">
            {tasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-2xl border-border shadow-soft">
                  <CardContent className="grid min-h-[420px] place-items-center p-8 text-center">
                    <div>
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                        <ListChecks className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-medium">Create your first career plan</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pick a goal and generate structured, editable tasks.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {summary && (
                  <Card className="rounded-2xl border-border bg-accent/40 shadow-soft">
                    <CardContent className="p-4 text-sm text-foreground/80">
                      {summary}
                    </CardContent>
                  </Card>
                )}

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

                <div className="flex flex-col gap-3">
                  {tasks.map((t, i) => (
                    <TaskCard
                      key={t.id}
                      index={i}
                      task={t}
                      onChange={(patch) => updateTask(t.id, patch)}
                      onRemove={() => removeTask(t.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const priorityBadge: Record<Task["priority"], string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/20 text-warning-foreground border-warning/30",
  low: "bg-success/15 text-success border-success/20",
};

function TaskCard({
  task,
  index,
  onChange,
  onRemove,
}: {
  task: Task;
  index: number;
  onChange: (patch: Partial<Task>) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={`rounded-2xl border-border shadow-soft transition ${task.done ? "opacity-60" : ""}`}>
        <CardContent className="grid gap-3 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.done}
              onCheckedChange={(v) => onChange({ done: !!v })}
              className="mt-1"
            />
            <div className="min-w-0 flex-1">
              <Input
                value={task.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className={`h-8 border-transparent bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:border-input focus-visible:bg-background ${
                  task.done ? "line-through" : ""
                }`}
              />
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${priorityBadge[task.priority]}`}
                >
                  {task.priority}
                </span>
                <span className="text-xs text-muted-foreground">{task.estimatedDuration}</span>
                <span className="text-xs text-muted-foreground">· due {task.deadline}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove task">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={task.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={2}
            className="resize-none rounded-lg text-xs"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
