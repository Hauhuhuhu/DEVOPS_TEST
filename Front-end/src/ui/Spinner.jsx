import { Loader2 } from "lucide-react";

function Spinner({ size = 18, className = "" }) {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-label="Loading">
      <Loader2 size={size} className={`animate-spin ${className}`} />
    </span>
  );
}

export default Spinner;
