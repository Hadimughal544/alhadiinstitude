import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-5xl text-teal dark:text-gold">AlHadiInstitude</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist.</p>
      <Link href="/home" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
