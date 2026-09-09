import type {
  PricingCreateContext,
  PricingPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { PricingCreateForm } from "../pricing/components/pricing-create-form";
import { PricingFields } from "../pricing/components/pricing-fields";

export function PricingCreateSlot(
  props: SlotWidgetProps<PricingCreateContext, PricingPayload>,
) {
  return (
    <PricingCreateForm
      context={props.context}
      defaultValues={props.initialValue}
      onValuesChange={props.onChange}
      registerHandle={props.registerHandle}
    >
      <PricingFields />
    </PricingCreateForm>
  );
}
