import assert from "node:assert/strict";
import test from "node:test";
import { shouldRefreshRequest } from "../src/utils/authRetryPolicy.js";

test("refreshes an eligible unauthorized request once", () => {
  assert.equal(
    shouldRefreshRequest({ response: { status: 401 }, config: {} }),
    true,
  );
  assert.equal(
    shouldRefreshRequest({ response: { status: 401 }, config: { _retry: true } }),
    false,
  );
  assert.equal(
    shouldRefreshRequest({ response: { status: 401 }, config: { skipAuthRefresh: true } }),
    false,
  );
});

test("does not refresh authorization failures or other statuses", () => {
  assert.equal(
    shouldRefreshRequest({ response: { status: 403 }, config: {} }),
    false,
  );
  assert.equal(
    shouldRefreshRequest({ response: { status: 500 }, config: {} }),
    false,
  );
});

test("does not refresh authentication endpoints", () => {
  for (const url of ["/login", "/auth/refresh", "/auth/logout"]) {
    assert.equal(
      shouldRefreshRequest({ response: { status: 401 }, config: { url } }),
      false,
      `${url} must preserve its original authentication error`,
    );
  }
});
