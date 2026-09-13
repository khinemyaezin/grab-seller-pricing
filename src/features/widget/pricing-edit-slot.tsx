import type {
  PricingEditContext,
  PricingEditPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { PricingEditFormContext } from "../pricing/components/pricing-edit-form-context";
import { PricingFields } from "../pricing/components/pricing-fields";
import { InlinePricingFields } from "../pricing/components/inline-pricing-fields";

export function PricingEditSlot(
  props: SlotWidgetProps<PricingEditContext, PricingEditPayload>,
) {
  const Fields = props.variant === "inline" ? InlinePricingFields : PricingFields;
  return (
    <PricingEditFormContext {...props}>
      <Fields />
    </PricingEditFormContext>
  );
}
