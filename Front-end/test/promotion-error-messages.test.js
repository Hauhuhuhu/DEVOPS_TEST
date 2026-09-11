import assert from "node:assert/strict";
import test from "node:test";
import { getPromotionErrorMessage } from "../src/utils/promotionErrorMessages.js";

test("maps promotion business codes to Vietnamese messages", () => {
  assert.equal(
    getPromotionErrorMessage({ response: { data: { code: "PROMOTION_NOT_FOUND" } } }),
    "Mã giảm giá không tồn tại",
  );
  assert.equal(
    getPromotionErrorMessage({ response: { data: { code: "PROMOTION_USAGE_EXHAUSTED" } } }),
    "Mã giảm giá đã hết lượt sử dụng",
  );
});

test("does not expose an unknown backend message", () => {
  assert.equal(
    getPromotionErrorMessage({
      response: { data: { code: "UNKNOWN", message: "internal database detail" } },
    }),
    "Mã giảm giá không hợp lệ hoặc không còn khả dụng",
  );
});
