// DOM Selection
export const $ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): T | null => parent.querySelector<T>(selector);

export const $$ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): NodeListOf<T> => parent.querySelectorAll<T>(selector);

// Element Creation
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: {
    classNames?: string[];
    text?: string;
    html?: string;
    attrs?: Record<string, string>;
  } = {}
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tagName);
  if (options.classNames) el.className = options.classNames.join(' ');
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }
  return el;
};

// Class Manipulation
export const addClass = (el: Element | null, ...classNames: string[]): void => {
  el?.classList.add(...classNames);
};

export const removeClass = (el: Element | null, ...classNames: string[]): void => {
  el?.classList.remove(...classNames);
};

export const toggleClass = (el: Element | null, className: string, force?: boolean): void => {
  el?.classList.toggle(className, force);
};

export const hasClass = (el: Element | null, className: string): boolean => 
  el?.classList.contains(className) ?? false;

// Event Handling
type EventHandler = (event: Event) => void;

export const on = (
  target: EventTarget,
  type: string,
  handler: EventHandler,
  options?: boolean | AddEventListenerOptions
): (() => void) => {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
};

// Visibility & Dimensions
export const isVisible = (el: HTMLElement | null): boolean => {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) &&
    style.visibility !== 'hidden' &&
    style.display !== 'none' &&
    parseFloat(style.opacity) > 0;
};

export const isInViewport = (el: HTMLElement | null): boolean => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Scroll Utilities
export const smoothScroll = (el: HTMLElement | null, offset = 0): void => {
  if (!el) return;
  const elementPosition = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: elementPosition + offset,
    behavior: 'smooth'
  });
};

// Form Helpers
export const getFormData = <T extends Record<string, any>>(form: HTMLFormElement): T => {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries()) as T;
};

// Clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};
