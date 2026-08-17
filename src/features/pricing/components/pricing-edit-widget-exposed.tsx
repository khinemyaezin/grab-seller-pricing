import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
} from "@khinemyaezin/seller-contracts";
import { usePricingEditSlot } from "../hooks/use-pricing-edit-slot";
import PricingEditWidget from "./pricing-edit-widget";

export type PricingEditWidgetExposedProps = ExtensionMountProps;

function PricingEditWidgetBound({
  groupId,
  slotId,
}: {
  groupId: string;
  slotId?: string;
}) {
  const { context, payload, onChange, ref, isLoading } = usePricingEditSlot(
    groupId,
    slotId ?? PRODUCT_EXTENSION_SLOTS.EDIT_PRICING,
  );

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
  slotId,
  platform,
  entryLink,
}: PricingEditWidgetExposedProps) {
  if (!entryLink || !groupId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <PricingEditWidgetBound groupId={groupId} slotId={slotId} />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
