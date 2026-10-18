import { createFileRoute } from "@tanstack/react-router";
import { handleTitle } from "@/lib/ai/chat.server";

export const Route = createFileRoute("/api/title")({
  server: { handlers: { POST: ({ request }) => handleTitle(request) } },
});
