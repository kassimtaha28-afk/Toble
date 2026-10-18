<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Toble UI pieces live in `src/components/toble/`; colors only via tokens in `src/styles.css` so light/dark themes stay consistent.
- Theme is a `.dark` class on `<html>`, set pre-paint by an inline script in `__root.tsx` from localStorage `toble-theme` — avoids flash on load.
- AI chat streams via server route `/api/chat` (`src/lib/ai/chat.server.ts`) through Lovable AI Gateway; model comes from env `TOBLE_MODEL` with a code default — keeps the key and model server-side.
- Conversations go through `src/lib/conversations.ts`: database store (RLS, own rows only) for signed-in users, localStorage store for guests — one interface so UI never branches on auth.
- Chat threads live at `/c/$id`; the new-chat page creates the thread then hands the first prompt over via sessionStorage.
- Rate limits are counted server-side in `usage_events` (service role only), per user or hashed guest IP.
