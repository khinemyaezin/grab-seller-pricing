import type {
  PricingEditContext,
  PricingEditPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { PricingEditFormContext } from "../pricing/components/pricing-edit-form-context";
import { PricingFields } from "../pricing/components/pricing-fields";

export function PricingEditSlot(
  props: SlotWidgetProps<PricingEditContext, PricingEditPayload>,
) {
  return (
    <PricingEditFormContext {...props}>
      <PricingFields />
    </PricingEditFormContext>
  );
}
