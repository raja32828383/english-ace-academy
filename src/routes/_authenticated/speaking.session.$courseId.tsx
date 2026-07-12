import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SpeakingSessionRunner } from "@/components/speaking/session-runner";
import { getSpeakingCourse } from "@/lib/speaking-content";

export const Route = createFileRoute("/_authenticated/speaking/session/$courseId")({
  component: SpeakingSessionPage,
});

function SpeakingSessionPage() {
  const { courseId } = useParams({ from: "/_authenticated/speaking/session/$courseId" });
  const course = getSpeakingCourse(courseId);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-8">
        {course ? (
          <SpeakingSessionRunner course={course} />
        ) : (
          <EmptyState
            icon={<Mic className="h-6 w-6" />}
            title="Course not found"
            description="This speaking course doesn't exist or has moved."
            action={
              <Button asChild variant="hero">
                <Link to="/speaking">Back to Speaking Lab</Link>
              </Button>
            }
          />
        )}
      </main>
    </div>
  );
}
