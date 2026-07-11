import { PhoneCall, ShieldX, UserCheck } from "lucide-react";

const actions = [
  {
    title: "Do not send advance payment",
    text: "Never pay upfront to unknown numbers or pages. Scammers often disappear after payment.",
    icon: ShieldX,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    title: "Verify identity before you pay",
    text: "Check official page links, business details, reviews and talk to people who used the service.",
    icon: UserCheck,
    color: "text-[#009879]",
    bg: "bg-[#e9f8f4]",
  },
  {
    title: "Use official communication",
    text: "Contact through official websites or verified numbers. Avoid WhatsApp-only communication.",
    icon: PhoneCall,
    color: "text-[#0b63f6]",
    bg: "bg-[#eef6ff]",
  },
];

export default function SuggestedSafetyActions() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#06285c]">
          Suggested safety actions
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <SafetyActionCard key={action.title} action={action} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetyActionCard({ action }) {
  const Icon = action.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${action.bg}`}
      >
        <Icon size={28} className={action.color} />
      </div>

      <h3 className="font-black text-[#06285c]">{action.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{action.text}</p>
    </article>
  );
}
