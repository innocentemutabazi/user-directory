import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library's auto-cleanup only runs when `globals` is on in some
// setups; calling it explicitly makes the behaviour independent of config.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia, which framer-motion's useReducedMotion
// and the theme toggle both read.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
