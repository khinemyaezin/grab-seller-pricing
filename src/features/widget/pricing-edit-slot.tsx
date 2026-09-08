import type {
  PricingEditContext,
  PricingEditPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { PricingEditForm } from "../pricing/components/pricing-edit-form";
import { PricingFields } from "../pricing/components/pricing-fields";

export function PricingEditSlot(
  props: SlotWidgetProps<PricingEditContext, PricingEditPayload>,
) {
  return (
    <PricingEditForm
      context={props.context}
      defaultValues={props.initialValue}
      onValuesChange={props.onChange}
      registerHandle={props.registerHandle}
    >
      <PricingFields />
    </PricingEditForm>
  );
}
