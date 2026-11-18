import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIntroPolicy } from './introPolicy.ts';

const ordinary = { reducedMotion: false, hasFragment: false, returning: false };
const memoryStorage = () => {
  const items = new Map();
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
};

// Catches replay on route remount / StrictMode effects consuming a second visit.
test('opening cue is claimed once across policies sharing session storage', () => {
  const storage = memoryStorage();
  assert.equal(createIntroPolicy(() => storage).claim(ordinary), true);
  assert.equal(createIntroPolicy(() => storage).claim(ordinary), false);
});

// Catches an animated opening shown despite an explicit motion preference.
test('reduced motion skips the cue and consumes the visit', () => {
  const policy = createIntroPolicy(memoryStorage);
  assert.equal(policy.claim({ ...ordinary, reducedMotion: true }), false);
  assert.equal(policy.claim(ordinary), false);
});

// Catches intro interruption of a direct content link or back-forward visit.
test('direct fragment and history return skip the opening', () => {
  for (const override of [{ hasFragment: true }, { returning: true }]) {
    assert.equal(createIntroPolicy(memoryStorage).claim({ ...ordinary, ...override }), false);
  }
});

// Catches blocked sessionStorage disabling the page or allowing repeated cues.
test('blocked session storage still permits one cue and suppresses subsequent claims', () => {
  const policy = createIntroPolicy(() => { throw new Error('Storage denied'); });
  assert.equal(policy.claim(ordinary), true);
  assert.equal(policy.claim(ordinary), false);
});
