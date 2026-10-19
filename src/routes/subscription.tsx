import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/components/toble/AppShell";
import { TobleMark } from "@/components/toble/Logo";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscriptions — Toble" },
      { name: "description", content: "Choose the perfect plan for Toble AI." },
    ],
  }),
  component: Subscription,
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic AI assistant features.",
    features: [
      "Access to standard AI model",
      "Up to 20 messages per day",
      "Basic response speed",
      "Community support",
    ],
    buttonText: "Current Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For power users who need high-speed responses and advanced tools.",
    features: [
      "Unlimited AI conversations",
      "Fastest response times",
      "Priority model access",
      "Advanced prompt suggestions",
      "Priority customer support",
    ],
    buttonText: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "Custom capabilities for teams and high-frequency usage.",
    features: [
      "Everything in Pro",
      "Dedicated API limits",
      "Custom system prompts",
      "24/7 dedicated support",
      "Early access to new features",
    ],
    buttonText: "Contact Sales",
    highlighted: false,
  },
];

function Subscription() {
  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto bg-[#12131C] text-white selection:bg-[#7C3AED]/30">
        {/* Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Chat</span>
          </Link>
          <div className="flex items-center gap-2">
            <TobleMark className="size-6 text-[#7C3AED]" />
            <span className="font-bold tracking-wide text-white">Toble</span>
          </div>
        </header>

        {/* Pricing Content */}
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-3.5 py-1 text-xs font-medium text-purple-300 backdrop-blur-md mb-4">
            <Sparkles className="size-3.5 text-[#7C3AED]" />
            <span>Flexible Pricing</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose your <span className="bg-gradient-to-r from-purple-400 via-[#7C3AED] to-indigo-400 bg-clip-text text-transparent">Toble Plan</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Unlock supercharged AI speed, higher limits, and priority features.
          </p>

          {/* Cards Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  tier.highlighted
                    ? "border-[#7C3AED] bg-[#1A1B26] shadow-xl shadow-[#7C3AED]/15 scale-105"
                    : "border-white/10 bg-[#1A1B26]/60 hover:border-white/20"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 right-6 rounded-full bg-[#7C3AED] px-3 py-0.5 text-xs font-semibold text-white shadow-md">
                    Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">{tier.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-white">{tier.price}</span>
                    {tier.period && <span className="text-xs text-slate-400">{tier.period}</span>}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-[#7C3AED]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`mt-8 w-full rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/25"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

 
