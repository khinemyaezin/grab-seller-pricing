import type {
  PricingCreateContext,
  PricingPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { PricingCreateForm } from "../pricing/components/pricing-create-form";
import { PricingFields } from "../pricing/components/pricing-fields";
import { InlinePricingFields } from "../pricing/components/inline-pricing-fields";

export function PricingCreateSlot(
  props: SlotWidgetProps<PricingCreateContext, PricingPayload>,
) {
  const Fields = props.variant === "inline" ? InlinePricingFields : PricingFields;
  return (
    <PricingCreateForm
      context={props.context}
      defaultValues={props.initialValue}
      onValuesChange={props.onChange}
      registerHandle={props.registerHandle}
    >
      <Fields />
    </PricingCreateForm>
  );
}
