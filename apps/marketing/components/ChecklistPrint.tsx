'use client';

// Small client-only button for the AEARS checklist page. The page itself is a
// server component; this just triggers the browser print dialog so a parent can
// save the checklist as a PDF or print it. It is hidden in the printed output.
export default function ChecklistPrint({
  label = 'Print or save as PDF',
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-secondary no-print"
      style={{ cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}
