/**
 * Тесты чистой логики инвентаризации (Node.js, без браузера).
 * Запуск: npm test
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logicPath = join(__dirname, '..', 'js', 'inventory-logic.js');
const logicCode = readFileSync(logicPath, 'utf8');

function loadLogic(L = {}) {
  const ctx = { L, console };
  vm.createContext(ctx);
  vm.runInContext(logicCode, ctx);
  return ctx;
}

test('invNormalizeTemplateFields: number dictionary + inline units', () => {
  const { invNormalizeTemplateFields } = loadLogic({});
  const out = invNormalizeTemplateFields([{
    key: 'k1',
    label: 'N',
    type: 'number',
    unitMode: 'dictionary',
    unitSource: 'inline',
    options: ['мм', 'см'],
  }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].unitSource, 'inline');
  assert.deepEqual(out[0].options, ['мм', 'см']);
  assert.equal(out[0].dictionarySlug, undefined);
});

test('invFieldOptionList: inline number units', () => {
  const ctx = loadLogic({});
  const field = ctx.invNormalizeTemplateFields([{
    key: 'k1', label: 'N', type: 'number', unitMode: 'dictionary', unitSource: 'inline', options: ['a', 'b'],
  }])[0];
  const opts = ctx.invFieldOptionList(field, {});
  assert.deepEqual(opts, ['a', 'b']);
});

test('invMergeRecordSnapshotWithTemplate: сохраняет поля только в снимке', () => {
  const { invMergeRecordSnapshotWithTemplate } = loadLogic({});
  const snap = [{ key: 'old', label: 'Old', type: 'text', required: false }];
  const tpl = [{ key: 'new', label: 'New', type: 'text', required: false }];
  const merged = invMergeRecordSnapshotWithTemplate(snap, tpl);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].key, 'old');
  assert.equal(merged[1].key, 'new');
  const oldF = merged.find(f => f.key === 'old');
  assert.ok(oldF);
  assert.equal(oldF.type, 'text');
});

test('invDeepClone: вложенные объекты не по ссылке', () => {
  const { invDeepClone } = loadLogic({});
  const a = { x: { amount: 1, unit: 'шт' } };
  const b = invDeepClone(a);
  b.x.amount = 99;
  assert.equal(a.x.amount, 1);
});

test('invValueFingerprint: number dictionary', () => {
  const { invValueFingerprint } = loadLogic({});
  const f = { type: 'number', unitMode: 'dictionary' };
  assert.equal(invValueFingerprint(f, { amount: 1, unit: 'кг' }), '{"amount":1,"unit":"кг"}');
});

test('invIsEmptyValue: boolean false считается пустым для required', () => {
  const { invIsEmptyValue } = loadLogic({});
  assert.equal(invIsEmptyValue({ type: 'boolean' }, false), true);
  assert.equal(invIsEmptyValue({ type: 'boolean' }, true), false);
});
