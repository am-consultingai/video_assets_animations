import { useEffect, useState } from "react";

const QUERY = "(max-width: 768px)";

/** True when viewport matches mobile layout breakpoint (≤768px). */
export function useMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
