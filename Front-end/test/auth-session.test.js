import assert from "node:assert/strict";
import test from "node:test";
import {
  clearSession,
  getAccessToken,
  getSession,
  setSession,
} from "../src/utils/authSession.js";

test.afterEach(() => clearSession());

test("keeps the access token and session in memory", () => {
  const session = setSession({
    token: "access-token",
    email: "cashier@example.com",
    role: "ROLE_USER",
  });

  assert.equal(getAccessToken(), "access-token");
  assert.deepEqual(getSession(), session);
  assert.deepEqual(session, {
    token: "access-token",
    email: "cashier@example.com",
    role: "ROLE_USER",
  });
});

test("clears the in-memory session", () => {
  setSession({ token: "access-token", email: "cashier@example.com", role: "ROLE_USER" });

  clearSession();

  assert.equal(getAccessToken(), null);
  assert.equal(getSession(), null);
});
