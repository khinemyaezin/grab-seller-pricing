import type {
  PricingEditContext,
  PricingEditPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { InlinePricingFields } from "../pricing/components/inline-pricing-fields";
import { PricingEditFormContext } from "../pricing/components/pricing-edit-form-context";

export function PricingEditInlineSlot(
  props: SlotWidgetProps<PricingEditContext, PricingEditPayload>,
) {
  return (
    <PricingEditFormContext
      {...props}
      loadingFallback={
        <span className="text-sm text-muted-foreground">…</span>
      }
    >
      <InlinePricingFields />
    </PricingEditFormContext>
  );
}
