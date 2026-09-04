import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
} from "@khinemyaezin/seller-contracts";
import { usePricingEditSlot } from "../hooks/use-pricing-edit-slot";
import InlinePricingEditWidget from "./inline-pricing-edit-widget";

export type InlinePricingEditWidgetExposedProps = ExtensionMountProps;

function InlinePricingEditWidgetBound({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.EDIT_PRICING_INLINE,
}: {
  groupId: string;
  slotId?: string;
}) {
  const { context, payload, onChange, ref, isLoading } = usePricingEditSlot(
    groupId,
    slotId,
  );

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
  slotId,
  platform,
  entryLink,
}: InlinePricingEditWidgetExposedProps) {
  if (!entryLink || !groupId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <InlinePricingEditWidgetBound groupId={groupId} slotId={slotId} />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
