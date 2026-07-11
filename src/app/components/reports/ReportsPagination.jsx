import { ChevronLeft, ChevronRight } from "lucide-react";

const pages = [1, 2, 3, 4, 5];

export default function ReportsPagination() {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-bold text-[#06285c]">1-6</span> of{" "}
        <span className="font-bold text-[#06285c]">724</span> reports
      </p>

      <div className="flex items-center gap-2">
        <PageButton>
          <ChevronLeft size={18} />
        </PageButton>

        {pages.map((page) => (
          <PageButton key={page} active={page === 1}>
            {page}
          </PageButton>
        ))}

        <span className="px-2 text-slate-400">...</span>

        <PageButton>73</PageButton>

        <PageButton>
          <ChevronRight size={18} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ children, active = false }) {
  return (
    <button
      className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold ${
        active
          ? "border-[#009879] bg-[#009879] text-white"
          : "border-slate-200 bg-white text-[#06285c]"
      }`}
    >
      {children}
    </button>
  );
}
