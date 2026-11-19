import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAT_POLICY } from './chat-policy.mjs';

test('chat policy prevents claims of external actions that the assistant cannot perform', () => {
  assert.match(CHAT_POLICY, /cannot send emails, contact people/i);
  assert.match(CHAT_POLICY, /never claim an action was completed/i);
  assert.match(CHAT_POLICY, /offer to draft it/i);
});

test('chat policy avoids guessing pronouns and missing email details', () => {
  assert.match(CHAT_POLICY, /do not infer gender or pronouns/i);
  assert.match(CHAT_POLICY, /ask for missing details or mark them as placeholders/i);
});

test('chat policy asks for concise, complete answers', () => {
  assert.match(CHAT_POLICY, /short, complete answers/i);
  assert.match(CHAT_POLICY, /do not stop mid-sentence/i);
});
