import { getCellsInRange, parseRange } from './spreadsheetRange';

export function parseNumericValue(val: string | undefined): number | null {
  if (val === undefined || val === null) return null;
  const cleaned = String(val)
    .replace(/,/g, '')
    .replace(/[₩$%\s]/g, '')
    .trim();
  if (cleaned === '') return null;
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

export function formatNumberWithCommas(num: number): string {
  if (Number.isInteger(num)) {
    return num.toLocaleString('ko-KR');
  }
  return num.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function evaluateFormula(formula: string, sheetData: Record<string, string>): string {
  if (!formula.startsWith('=')) {
    return formula;
  }

  const expr = formula.substring(1).trim().toUpperCase();

  // 1. Function patterns: SUM, AVERAGE, COUNT, MIN, MAX
  const funcMatch = expr.match(/^([A-Z]+)\(([^)]+)\)$/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const argStr = funcMatch[2];
    const cellCoords = getCellsInRange(argStr);

    const numericValues: number[] = [];
    for (const coord of cellCoords) {
      const raw = sheetData[coord];
      const evaluated = raw && raw.startsWith('=') ? evaluateFormula(raw, sheetData) : raw;
      const num = parseNumericValue(evaluated);
      if (num !== null) {
        numericValues.push(num);
      }
    }

    if (funcName === 'SUM') {
      const sum = numericValues.reduce((acc, curr) => acc + curr, 0);
      return formatNumberWithCommas(sum);
    }

    if (funcName === 'AVERAGE') {
      if (numericValues.length === 0) return '0';
      const avg = numericValues.reduce((acc, curr) => acc + curr, 0) / numericValues.length;
      return formatNumberWithCommas(avg);
    }

    if (funcName === 'COUNT') {
      return String(numericValues.length);
    }

    if (funcName === 'MIN') {
      if (numericValues.length === 0) return '0';
      return formatNumberWithCommas(Math.min(...numericValues));
    }

    if (funcName === 'MAX') {
      if (numericValues.length === 0) return '0';
      return formatNumberWithCommas(Math.max(...numericValues));
    }
  }

  // 2. Simple arithmetic with cell references like C2*1.1 or C2+D2
  try {
    const replaced = expr.replace(/[A-Z]+\d+/g, (match) => {
      const val = sheetData[match];
      const evaluated = val && val.startsWith('=') ? evaluateFormula(val, sheetData) : val;
      const num = parseNumericValue(evaluated);
      return num !== null ? String(num) : '0';
    });

    if (/^[0-9+\-*/().\s]+$/.test(replaced)) {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${replaced})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return formatNumberWithCommas(result);
      }
    }
  } catch {
    // If formula evaluation fails, return original
  }

  return formula;
}

export function computeRangeStats(rangeStr: string, sheetData: Record<string, string>): { count: number; sum: number; average: number; hasNumbers: boolean } {
  const cells = getCellsInRange(rangeStr);
  let sum = 0;
  let count = 0;

  for (const coord of cells) {
    const raw = sheetData[coord];
    const evaluated = raw && raw.startsWith('=') ? evaluateFormula(raw, sheetData) : raw;
    const num = parseNumericValue(evaluated);
    if (num !== null) {
      sum += num;
      count++;
    }
  }

  return {
    count,
    sum,
    average: count > 0 ? sum / count : 0,
    hasNumbers: count > 0,
  };
}
