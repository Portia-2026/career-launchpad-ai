import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Moon, Sun, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/session-store";
import { PageHeader } from "./email";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Youth Career Launchpad" },
      { name: "description", content: "Manage appearance and reset your current session." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const reset = useSession((s) => s.reset);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Simple controls — no account required."
      />

      <Card className="rounded-2xl border-border shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Appearance</CardTitle>
          <CardDescription>Switch between light and dark themes.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <Label>Dark mode</Label>
          </div>
          <Switch checked={dark} onCheckedChange={setDark} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Session</CardTitle>
          <CardDescription>
            Clear counters and recent activity. Everything is already cleared on refresh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              reset();
              toast.success("Session cleared");
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset session
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Youth Career Launchpad Assistant is a stateless AI companion for South African youth,
          graduates, and job seekers. No login, no database, no stored data.
        </CardContent>
      </Card>
    </div>
  );
}
