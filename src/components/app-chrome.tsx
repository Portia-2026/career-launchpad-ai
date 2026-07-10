import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tools, tips, prompts…"
          className="h-9 rounded-full border-border bg-muted/40 pl-9"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-full">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background/60 px-4 py-3 text-center text-xs text-muted-foreground sm:px-6">
      AI suggestions should be reviewed before use. Built for responsible workplace productivity.
    </footer>
  );
}
