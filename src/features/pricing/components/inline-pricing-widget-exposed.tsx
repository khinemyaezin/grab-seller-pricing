import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PricingCreateContext,
  PricingPayload,
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
} from "@khinemyaezin/seller-contracts";
import InlinePricingWidget from "./inline-pricing-widget";
import { usePricingNewSlot } from "../hooks/use-pricing-new-slot";

export type InlinePricingWidgetExposedProps = ExtensionMountProps;

export type InlinePricingWidgetHandle = {
  validate: () => Promise<{
    value?: PricingPayload;
    errors?: Record<string, string>;
  }>;
  getValues: () => PricingPayload;
};

export default function InlinePricingWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE,
  context: initialContext,
  platform,
  entryLink,
}: InlinePricingWidgetExposedProps) {
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
        <InlinePricingWidget
          ref={ref}
          context={context}
          value={payload}
          onChange={onChange} />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
