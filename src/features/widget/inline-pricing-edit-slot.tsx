import type {
  PricingEditContext,
  PricingEditPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { InlinePricingFields } from "../pricing/components/inline-pricing-fields";
import { PricingEditForm } from "../pricing/components/pricing-edit-form";

export function PricingEditInlineSlot(
  props: SlotWidgetProps<PricingEditContext, PricingEditPayload>,
) {
  return (
    <PricingEditForm
      context={props.context}
      defaultValues={props.initialValue}
      onValuesChange={props.onChange}
      registerHandle={props.registerHandle}
      loadingFallback={
        <span className="text-sm text-muted-foreground">…</span>
      }
    >
      <InlinePricingFields />
    </PricingEditForm>
  );
}
