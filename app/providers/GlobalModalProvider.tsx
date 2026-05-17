"use client";

import React from "react";
import type { ModalState } from "@/lib/services/modalService";
import { ModalService } from "@/lib/services/modalService";

interface GlobalModalContextValue {
  modalState: ModalState;
  resolver: ((value: boolean) => void) | null;
}

const defaultState: ModalState = { open: false, title: "" };

const GlobalModalContext = React.createContext<GlobalModalContextValue>({
  modalState: defaultState,
  resolver: null,
});

export function GlobalModalProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [modalState, setModalState] = React.useState<ModalState>(defaultState);
  const [resolver, setResolver] = React.useState<
    ((value: boolean) => void) | null
  >(null);

  React.useEffect(() => {
    ModalService.registerListener((nextState, nextResolver) => {
      setModalState(nextState);
      setResolver(() => nextResolver);
    });

    return () => {
      ModalService.unregisterListener();
    };
  }, []);

  return (
    <GlobalModalContext.Provider value={{ modalState, resolver }}>
      {children}
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal(): GlobalModalContextValue {
  return React.useContext(GlobalModalContext);
}
