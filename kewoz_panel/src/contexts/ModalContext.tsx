import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ModalContextType {
  openAvatarModal: () => void;
  setOpenAvatarModal: (fn: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [openAvatarModal, setOpenAvatarModalFn] = useState<() => void>(() => () => {});

  const setOpenAvatarModal = (fn: () => void) => {
    setOpenAvatarModalFn(() => fn);
  };

  return (
    <ModalContext.Provider value={{ openAvatarModal, setOpenAvatarModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
