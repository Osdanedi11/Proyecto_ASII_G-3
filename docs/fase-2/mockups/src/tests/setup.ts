import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { style: { width: 800, height: 320 } }, children),
  };
});

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 1200,
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 640,
});

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    width: 1200,
    height: 640,
    top: 0,
    left: 0,
    bottom: 640,
    right: 1200,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  };
};
