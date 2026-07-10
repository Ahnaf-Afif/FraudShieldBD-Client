import { ArrowRight, ClipboardList, Search, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Report",
    description: "Submit details of the fraud you experienced or witnessed.",
    icon: ClipboardList,
  },
  {
    number: "2",
    title: "Search",
    description: "Check before you pay and see real experiences from others.",
    icon: Search,
  },
  {
    number: "3",
    title: "Stay Safe",
    description:
      "Get notified, follow guides and help keep the community safe.",
    icon: ShieldCheck,
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <h2 className="text-center text-3xl font-black text-[#06285c]">
        How <span className="text-[#009879]">FraudShield BD</span> Works
      </h2>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
        {steps.map((step, index) => (
          <StepWithArrow
            key={step.number}
            step={step}
            showArrow={index !== steps.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function StepWithArrow({ step, showArrow }) {
  return (
    <>
      <WorkStep step={step} />

      {showArrow && (
        <div className="hidden justify-center text-[#0b63f6] lg:flex">
          <ArrowRight size={28} />
        </div>
      )}
    </>
  );
}

function WorkStep({ step }) {
  const Icon = step.icon;

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-[#009879] text-sm font-black text-white">
        {step.number}
      </div>

      <div className="mt-3 flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
          <Icon size={34} />
        </div>

        <div>
          <h3 className="text-xl font-black text-[#06285c]">{step.title}</h3>
          <p className="mt-1 leading-6 text-slate-600">{step.description}</p>
        </div>
      </div>
    </div>
  );
}
