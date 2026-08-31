import { describe, it, expect } from 'vitest';
import React from 'react';
import App from '../App';

describe('App Root Render Test', () => {
  it('imports and evaluates App without crashing', () => {
    expect(App).toBeDefined();
  });
});
