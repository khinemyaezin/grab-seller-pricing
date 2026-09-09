import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { createExposedSlot } from "@khinemyaezin/seller-ui";
import { PricingCreateInlineSlot } from "./inline-pricing-create-slot";

export default createExposedSlot({
  defaultSlotId: PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE,
  Widget: PricingCreateInlineSlot,
});
