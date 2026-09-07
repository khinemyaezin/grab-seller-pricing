import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
  type PricingEditContext,
  type PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import { usePricingEditSlot, type UsePricingEditSlotProps } from "../hooks/use-pricing-edit-slot";
import PricingEditWidget from "./pricing-edit-widget";

export type PricingEditWidgetExposedProps = ExtensionMountProps;

function PricingEditWidgetBound(props: UsePricingEditSlotProps) {
  const { context, payload, onChange, ref, isLoading } = usePricingEditSlot(props);

  return (
    <PricingEditWidget
      ref={ref}
      context={context}
      value={payload}
      onChange={onChange}
      isLoading={isLoading}
    />
  );
}

export default function PricingEditWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.EDIT_PRICING,
  context,
  initialValue,
  onChange,
  registerHandle,
  platform,
  entryLink,
}: PricingEditWidgetExposedProps) {
  if (!entryLink || !groupId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <PricingEditWidgetBound
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
