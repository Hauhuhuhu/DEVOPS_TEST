import assert from "node:assert/strict";
import test from "node:test";
import { getLoginErrorMessage } from "../src/utils/authErrorMessages.js";

test("prefers the backend login message", () => {
  assert.equal(
    getLoginErrorMessage({
      response: { status: 401, data: { message: "Email hoặc mật khẩu không chính xác" } },
    }),
    "Email hoặc mật khẩu không chính xác",
  );
});

test("uses a stable Vietnamese fallback for an unauthorized login", () => {
  assert.equal(
    getLoginErrorMessage({ response: { status: 401, data: {} } }),
    "Email hoặc mật khẩu không chính xác",
  );
});

test("does not expose Axios technical errors to the login form", () => {
  assert.equal(
    getLoginErrorMessage({ message: "Request failed with status code 401" }),
    "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
  );
});
