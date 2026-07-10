import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, ListChecks, MessageSquare, Sparkles, ArrowRight, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/session-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Youth Career Launchpad Assistant" },
      {
        name: "description",
        content:
          "Your AI career companion — generate emails, plans, and get workplace guidance in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { emailsGenerated, plansCreated, chatsSent, activity } = useSession();

  const stats = [
    { label: "Emails Generated", value: emailsGenerated, icon: Mail },
    { label: "Plans Created", value: plansCreated, icon: ListChecks },
    { label: "AI Conversations", value: chatsSent, icon: MessageSquare },
    { label: "Productivity Tools", value: 3, icon: Wrench },
  ];

  const quickActions = [
    { title: "Generate Email", to: "/email", icon: Mail, tone: "Draft a workplace email in seconds." },
    { title: "Create Task Plan", to: "/planner", icon: ListChecks, tone: "Turn a career goal into a plan." },
    { title: "Ask AI Career Assistant", to: "/chat", icon: MessageSquare, tone: "Chat with your career coach." },
  ] as const;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-10"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 gap-1 rounded-full">
              <Sparkles className="h-3 w-3" /> AI Career Companion
            </Badge>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              Welcome to Youth Career Launchpad Assistant
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Your AI career companion — built for South African youth, graduates, and interns
              stepping into the world of work.
            </p>
          </div>
          <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-secondary to-primary text-primary-foreground shadow-soft sm:flex">
            <Sparkles className="h-10 w-10" />
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
          >
            <Card className="rounded-2xl border-border shadow-soft">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-semibold leading-none">{s.value}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Quick actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="group">
              <Card className="h-full rounded-2xl border-border shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-base">{a.title}</CardTitle>
                    <CardDescription>{a.tone}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="gap-1 px-2 text-primary">
                    Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Recent activity</h2>
        <Card className="rounded-2xl border-border shadow-soft">
          <CardContent className="p-0">
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No activity yet this session</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Generate your first email, plan, or chat message to see it here. Nothing is saved
                  after you refresh.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <ActivityIcon type={a.type} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ActivityIcon({ type }: { type: "email" | "plan" | "chat" }) {
  const Icon = type === "email" ? Mail : type === "plan" ? ListChecks : MessageSquare;
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
      <Icon className="h-4 w-4" />
    </div>
  );
}
