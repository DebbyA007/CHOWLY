"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// The staff PIN lives in React state for the life of this tab and nowhere else. Not
// localStorage, not sessionStorage: both are readable by any script on the page. A
// reload asks for it again, which is the honest trade for keeping it out of storage.
type StaffPinContextValue = {
  pin: string | null;
  setPin: (pin: string | null) => void;
};

const StaffPinContext = createContext<StaffPinContextValue | null>(null);

export function StaffPinProvider({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState<string | null>(null);
  return <StaffPinContext.Provider value={{ pin, setPin }}>{children}</StaffPinContext.Provider>;
}

export function useStaffPin(): StaffPinContextValue {
  const value = useContext(StaffPinContext);
  if (!value) throw new Error("useStaffPin needs a StaffPinProvider above it");
  return value;
}
