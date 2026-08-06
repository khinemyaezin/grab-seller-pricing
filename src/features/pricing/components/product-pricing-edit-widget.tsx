import type { ProductEditPricingSlotProps } from "@khinemyaezin/seller-contracts";

/**
 * Edit-path pricing widget (fetch + mutate). Implementation lands in pricing-edit-widget phase.
 * Shell registers this under PRODUCT_EXTENSION_SLOTS.EDIT_PRICING.
 */
export type ProductPricingEditWidgetProps = ProductEditPricingSlotProps;

export default function ProductPricingEditWidget(_props: ProductPricingEditWidgetProps) {
  return null;
}
