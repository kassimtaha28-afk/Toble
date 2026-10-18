# Toble Curious Companion

Build Toble — A Modern AI Chatbot

Create a polished, fully functional AI chatbot web application called Toble, inspired by the ease of use of ChatGPT, but with its own unique branding, visual identity, and personality.

1. Purpose

Toble is a general-purpose AI assistant that helps users answer questions, learn, write, brainstorm, solve problems, summarize documents, and write or understand code.

The application must be a working AI product, not merely a static mockup.

2. Design and branding

Product name: Toble.

Create a unique, memorable logo using the letter T or a simple abstract symbol.

Use a modern, premium, minimalist design.

Use a clean light theme with white backgrounds, dark text, subtle grey borders, and tasteful blue-purple accents.

Include a dark mode and a toggle to switch themes.

Use rounded message bubbles, smooth transitions, readable typography, and generous spacing.

Make the interface responsive on desktop, tablet, and mobile.

Create an original design; do not copy another company's logo or branding.

3. Main chat interface

Create a complete chat interface with:

A left sidebar containing the Toble logo, a New Chat button, recent conversations, and settings.

A main chat area with a welcoming heading: "What can Toble help you with?"

A large, rounded message input at the bottom.

A send button, an Enter-to-send shortcut, and a Shift+Enter newline shortcut.

Suggested prompts such as "Help me learn something new", "Write something for me", "Help me code", and "Brainstorm ideas".

Distinct user and AI messages.

Markdown formatting for AI answers, including headings, lists, links, tables, and code blocks.

A visible loading indicator while the AI generates an answer.

Copy-response, regenerate-response, and stop-generating controls where supported.

Helpful error messages and a retry option if a request fails.

4. Real AI functionality

Integrate the OpenAI API through a secure server-side endpoint.

Requirements:

Use an AI model available to the configured API account.

Send user messages to the model and display its real responses.

Preserve the conversation context so Toble can understand follow-up questions.

Display responses progressively when streaming is supported.

Keep the model configurable on the server.

Never expose the API key in frontend code, browser storage, public source files, or client-side network requests.

Use environment variables or the platform's secure secrets manager.

Handle API errors, timeouts, usage limits, and empty messages gracefully.

Do not simulate AI responses or hardcode fake answers as the finished functionality.

5. Conversation management

Implement:

Start a new conversation.

Save and revisit conversation history.

Automatically generate a short conversation title.

Rename and delete conversations.

Keep each conversation's messages in the correct order.

Add a confirmation step before permanently deleting a conversation.

6. User accounts and database

Use Supabase if supported by the project.

Add:

Sign up, login, logout, and password recovery.

A database for users, conversations, and messages.

Access controls so each authenticated user can access only their own private conversations.

Appropriate database permissions and Row Level Security policies.

A guest mode if practical, with a clear explanation that guest conversations may not persist across devices.

Never store passwords directly or expose private user information.

7. Additional features

Design the app so these can be added in future versions:

File and document uploads.

Image understanding, when supported by the chosen model.

Voice input and spoken responses.

Web search with citations.

User-selectable AI response styles.

Exporting conversations.

Usage limits and an account settings page.

Do not display these as working features until they are actually implemented.

8. Settings and privacy

Include:

Light and dark themes.

A profile and account settings page.

Clear conversation deletion controls.

A privacy policy placeholder that can be completed before public launch.

A visible disclaimer that AI responses can sometimes be inaccurate.

Rate limiting and server-side validation to reduce abuse and unexpected costs.

9. Technical requirements

Use the builder's recommended modern web stack. Prefer a maintainable React-based application with TypeScript where supported.

Separate the frontend, backend AI endpoint, and database responsibilities.

Validate requests on the server.

Keep secrets out of source control.

Add useful error handling and loading states.

Follow accessible design practices.

Make the app usable on small mobile screens.

Avoid unnecessary dependencies and features that aren't needed for the first release.

10. Implementation plan

Build Toble in stages.

Stage 1: Create the branded responsive interface, sidebar, chat layout, message composer, and theme toggle.

Stage 2: Connect the real AI model through a secure server-side API endpoint and implement contextual conversations.

Stage 3: Add Supabase authentication, conversation storage, and user-specific access controls.

Stage 4: Add conversation management, loading states, errors, and mobile polish.

Stage 5: Test the full application, fix bugs, verify API-key security and database permissions, and prepare it for deployment.

Start with Stage 1, but structure the project so the following stages can be implemented cleanly. After each stage, explain what has been completed, identify any configuration I must provide, and test the functionality before proceeding.

The final goal is a real, reliable, secure, professional AI chatbot called Toble that can be used by actual people.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://toble-curious-companion.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f15de851-4c6d-5946-a82a-e29a8c01dd96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
