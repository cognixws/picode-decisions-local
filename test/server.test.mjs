import assert from "node:assert/strict";
import { test } from "node:test";
import { onThisComputer, renderInstructions, renderState, spanProbability, yesProbability } from "../server.mjs";

test("the model server must be on this computer", () => {
  assert.equal(onThisComputer("http://127.0.0.1:8080/v1"), true);
  assert.equal(onThisComputer("http://localhost:11434/v1"), true);
  assert.equal(onThisComputer("http://[::1]:1234/v1"), true);
  assert.equal(onThisComputer("http://192.168.0.10:8080/v1"), false);
  assert.equal(onThisComputer("https://api.example.com/v1"), false);
  assert.equal(onThisComputer("file:///etc/passwd"), false);
  assert.equal(onThisComputer("not a url"), false);
});

test("the state and the instructions read as text", () => {
  assert.equal(renderState({ window: "notepad.exe", outline: "- a\n- b" }), 'window: "notepad.exe"\noutline:\n- a\n- b');
  assert.equal(renderState("plain"), "plain");
  assert.equal(renderInstructions({ goal: "Save", question: "Which?" }), "goal: Save\nquestion: Which?");
  assert.equal(renderInstructions("Which?"), "Which?");
});

test("a choice's confidence is the probability of its own tokens", () => {
  const tokens = [{ token: '{"', logprob: 0 }, { token: "choice", logprob: 0 }, { token: '":"', logprob: 0 }, { token: "e", logprob: Math.log(0.5) }, { token: "12", logprob: Math.log(0.5) }, { token: '"}', logprob: 0 }];
  assert.equal(spanProbability(tokens, '{"choice":"e12"}', "e12"), 0.25);
  assert.equal(spanProbability([], '{"choice":"e12"}', "e12"), null);
});

test("yes is read from the first token's alternatives", () => {
  assert.ok(Math.abs(yesProbability([{ token: "Yes", logprob: Math.log(0.6) }, { token: "No", logprob: Math.log(0.2) }]) - 0.75) < 1e-9);
  assert.equal(yesProbability([{ token: "Maybe", logprob: 0 }]), null);
});
