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

export type PricingWidgetHandle = {
  validate: () => Promise<{
    value?: PricingPayload;
    errors?: Record<string, string>;
  }>;
  getValues: () => PricingPayload;
};

export default function ProductPricingWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  context: initialContext,
  platform,
  entryLink,
}: ProductPricingWidgetExposedProps) {
  const { context, payload, ref, onChange } = usePricingNewSlot({
    platform,
    groupId,
    slotId,
    initialContext: initialContext as PricingCreateContext,
  });

  if (!entryLink || !groupId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <ProductPricingWidget
          ref={ref}
          context={context}
          value={payload}
          onChange={onChange}
        />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
