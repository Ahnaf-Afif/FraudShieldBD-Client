const steps = [
  { number: 1, title: "Category", subtitle: "What happened?" },
  { number: 2, title: "Story", subtitle: "Your experience" },
  { number: 3, title: "Financial Info", subtitle: "Money details" },
  { number: 4, title: "Identifiers", subtitle: "People & accounts" },
  { number: 5, title: "Evidence", subtitle: "Screenshots & files" },
  { number: 6, title: "Review", subtitle: "Submit report" },
];

export default function ReportStepBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        {steps.map((step) => (
          <StepItem key={step.number} step={step} />
        ))}
      </div>
    </section>
  );
}

function StepItem({ step }) {
  const isActive = step.number === 1;

  return (
    <div className={`rounded-xl p-4 ${isActive ? "bg-[#e9f8f4]" : "bg-white"}`}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
            isActive ? "bg-[#009879] text-white" : "bg-slate-100 text-[#06285c]"
          }`}
        >
          {step.number}
        </div>

        <div>
          <p className="font-black text-[#06285c]">{step.title}</p>
          <p className="text-xs text-slate-500">{step.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
