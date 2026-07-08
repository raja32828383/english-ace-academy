import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

/**
 * Shared site footer so branding and links stay consistent across pages.
 */
export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p>© {new Date().getFullYear()} TwoMoon Academy. Belajar bahasa Inggris, made joyful.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-4 font-semibold">
          <Link to="/learn" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Lessons
          </Link>
          <Link to="/leaderboard" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Leaderboard
          </Link>
          <Link to="/auth" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
