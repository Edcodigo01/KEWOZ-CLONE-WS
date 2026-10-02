import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';

type AnyProps = Record<string, unknown>;

type ModalRender = {
  Component: React.ComponentType<any> | null;
  props?: AnyProps | undefined;
  title?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined;
};

type ModalContextValue = {
  open: <P extends AnyProps>(options: {
    component: React.ComponentType<P>;
    props?: P;
    title?: string;
    size?: ModalRender['size'];
  }) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalRender>({ Component: null });
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
    // clear after close animation
    setTimeout(() => setState({ Component: null }), 200);
  }, []);

  const open: ModalContextValue["open"] = useCallback(({ component, props, title, size }) => {
    setState({
      Component: component,
      ...(props !== undefined ? { props } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(size !== undefined ? { size } : {}),
    });
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  const { Component, props, title, size } = state;

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={close}
        {...(title !== undefined ? { title } : {})}
        {...(size !== undefined ? { size } : {})}
      >
        {Component ? <Component {...(props as AnyProps)} /> : null}
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}