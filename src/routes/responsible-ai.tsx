import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, AlertTriangle, EyeOff, HandHeart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "./email";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — Youth Career Launchpad" },
      {
        name: "description",
        content:
          "How to use AI-generated career content responsibly and protect your personal information.",
      },
    ],
  }),
  component: ResponsibleAIPage,
});

const points = [
  {
    icon: AlertTriangle,
    title: "AI can make mistakes",
    body: "AI-generated content may contain errors, outdated details, or inaccurate claims. Always fact-check before you send or submit anything.",
  },
  {
    icon: ShieldCheck,
    title: "Review every output",
    body: "Read every draft carefully. Edit tone, phrasing, and facts to make sure it truly represents you.",
  },
  {
    icon: EyeOff,
    title: "Keep confidential info out",
    body: "Do not enter passwords, ID numbers, banking details, or anything confidential into AI tools — including this one.",
  },
  {
    icon: HandHeart,
    title: "AI supports, it doesn't replace you",
    body: "This assistant is a productivity aid. Your judgement, experience, and professionalism come first.",
  },
];

function ResponsibleAIPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        icon={ShieldCheck}
        title="Responsible AI"
        description="Guidance for using AI at work — safely, thoughtfully, and to your benefit."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <Card key={p.title} className="rounded-2xl border-border shadow-soft">
            <CardHeader className="flex flex-row items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <CardTitle className="font-display text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{p.body}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-soft">
        <CardContent className="p-6 text-sm text-foreground/80">
          This assistant is stateless. Nothing you type is saved after you close or refresh the
          browser. There is no account, no history, and no personal data collection.
        </CardContent>
      </Card>
    </div>
  );
}
