// tests/board.test.js
import { calculateListTotals } from '../src/js/utils.js';

describe('calculateListTotals', () => {
  test('should calculate correct totals for a list with cards', () => {
    const list = {
      cards: [
        { initialEstimate: 5, remainingHours: 3 },
        { initialEstimate: 10, remainingHours: 5 },
        { initialEstimate: 2, remainingHours: 0 }
      ]
    };
    const totals = calculateListTotals(list);
    expect(totals.initial).toBe(17);
    expect(totals.remaining).toBe(8);
  });

  test('should handle cards with missing or zero estimates', () => {
    const list = {
      cards: [
        { initialEstimate: 5 },
        { remainingHours: 3 },
        {}
      ]
    };
    const totals = calculateListTotals(list);
    expect(totals.initial).toBe(5);
    expect(totals.remaining).toBe(3);
  });

  test('should return zero for an empty list', () => {
    const list = {
      cards: []
    };
    const totals = calculateListTotals(list);
    expect(totals.initial).toBe(0);
    expect(totals.remaining).toBe(0);
  });

  test('should return zero for a list with no cards property', () => {
    const list = {};
    const totals = calculateListTotals(list);
    expect(totals.initial).toBe(0);
    expect(totals.remaining).toBe(0);
  });
});
