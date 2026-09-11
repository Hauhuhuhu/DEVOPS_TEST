import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultVariant } from "../src/utils/variantDefaults.js";

test("keeps technical Variant attribute keys stable", () => {
  const variant = createDefaultVariant();

  assert.deepEqual(variant.attributes, [
    { key: "Color", value: "" },
    { key: "Size", value: "" },
  ]);
});

test("creates independent default Variant values", () => {
  const first = createDefaultVariant();
  const second = createDefaultVariant();
  first.attributes[0].value = "Red";

  assert.equal(second.attributes[0].value, "");
});
