// components/Portal.tsx
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type PortalProps = {
  children: React.ReactNode;
  container?: Element;
};

function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(children, container ?? document.body);
}

export default Portal;