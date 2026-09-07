import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PricingCreateContext,
  PricingPayload,
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
} from "@khinemyaezin/seller-contracts";
import ProductPricingWidget from "./product-pricing-widget";
import { usePricingNewSlot } from "../hooks/use-pricing-new-slot";

export type ProductPricingWidgetExposedProps = ExtensionMountProps;

export default function ProductPricingWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  context,
  initialValue,
  onChange,
  registerHandle,
  platform,
  entryLink,
}: ProductPricingWidgetExposedProps) {
  const {
    context: slotContext,
    payload,
    ref,
    onChange: handleChange,
  } = usePricingNewSlot({
    groupId,
    slotId,
    context: context as PricingCreateContext | undefined,
    initialValue: initialValue as PricingPayload | undefined,
    onChange: onChange as ((value: PricingPayload) => void) | undefined,
    registerHandle,
  });

  if (!entryLink || !groupId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <ProductPricingWidget
          ref={ref}
          context={slotContext}
          value={payload}
          onChange={handleChange}
        />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
