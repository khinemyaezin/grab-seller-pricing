import type {
  PricingCreateContext,
  PricingPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { PricingCreateForm } from "../pricing/components/pricing-create-form";
import { InlinePricingFields } from "../pricing/components/inline-pricing-fields";

export function PricingCreateInlineSlot(
  props: SlotWidgetProps<PricingCreateContext, PricingPayload>,
) {
  return (
    <PricingCreateForm
      context={props.context}
      defaultValues={props.initialValue}
      onValuesChange={props.onChange}
      registerHandle={props.registerHandle}
    >
      <InlinePricingFields />
    </PricingCreateForm>
  );
}
