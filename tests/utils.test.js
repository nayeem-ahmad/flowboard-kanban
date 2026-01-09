// tests/utils.test.js
import { generateId } from '../src/js/utils.js';

describe('generateId', () => {
  test('should generate a string ID', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  test('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});
