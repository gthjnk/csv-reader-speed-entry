import assert from 'node:assert/strict';
import { test } from 'node:test';
import { run } from '../solve.js';

test('retains trailing fields, ignores blank records, and normalizes the width', () => {
  assert.deepEqual(run({ text: '\ufeff\r\nx,y\n1,\r\n\n2\n3,4,5,', header: true }), {
    columns: ['x', 'y'],
    rows: [['1', ''], ['2', ''], ['3', '4']],
    errors: [
      { code: 'short_row', line: 5, row: 1, fields: 1 },
      { code: 'long_row', line: 6, row: 2, extra: ['5', ''] },
    ],
  });
});

test('normalizes quoted line breaks and reports junk after stray carriage returns', () => {
  assert.deepEqual(run({ text: '"a""b\rc\r\nd\ne"j\runk,X\r\nY', header: false }), {
    columns: null,
    rows: [['a"b\nc\nd\nejunk', 'X'], ['Y', '']],
    errors: [
      { code: 'stray_cr', line: 1, row: 0 },
      { code: 'quote_junk', line: 1, row: 0 },
      { code: 'short_row', line: 5, row: 1, fields: 1 },
    ],
  });
});

test('recovers an unclosed quote without treating its tentative newlines as consumed', () => {
  assert.deepEqual(run({ text: 'a,b\n"open,z\r\nnext\rvalue,😀', header: true }), {
    columns: ['a', 'b'],
    rows: [['"open', 'z'], ['nextvalue', '😀']],
    errors: [
      { code: 'unterminated_quote', line: 2, row: 0 },
      { code: 'stray_cr', line: 3, row: 1 },
    ],
  });
});

test('skips stray-CR-only records but keeps quoted empty fields', () => {
  assert.deepEqual(run({ text: '\ufeff\r\r\n""\n', header: true }), {
    columns: [''],
    rows: [],
    errors: [{ code: 'stray_cr', line: 1, row: null }],
  });
  assert.deepEqual(run({ text: '', header: true }), { columns: [], rows: [], errors: [] });
});
