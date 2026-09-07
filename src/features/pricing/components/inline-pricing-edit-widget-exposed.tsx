import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
  type PricingEditContext,
  type PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import { usePricingEditSlot, type UsePricingEditSlotProps } from "../hooks/use-pricing-edit-slot";
import InlinePricingEditWidget from "./inline-pricing-edit-widget";

export type InlinePricingEditWidgetExposedProps = ExtensionMountProps;

function InlinePricingEditWidgetBound(props: UsePricingEditSlotProps) {
  const { context, payload, onChange, ref, isLoading } = usePricingEditSlot(props);

  return (
    <InlinePricingEditWidget
      ref={ref}
      context={context}
      value={payload}
      onChange={onChange}
      isLoading={isLoading}
    />
  );
}

export default function InlinePricingEditWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.EDIT_PRICING_INLINE,
  context,
  initialValue,
  onChange,
  registerHandle,
  platform,
  entryLink,
}: InlinePricingEditWidgetExposedProps) {
  if (!entryLink || !groupId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <InlinePricingEditWidgetBound
          groupId={groupId}
          slotId={slotId}
          context={context as PricingEditContext | undefined}
          initialValue={initialValue as PricingEditPayload | undefined}
          onChange={onChange as ((value: PricingEditPayload) => void) | undefined}
          registerHandle={registerHandle}
        />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
