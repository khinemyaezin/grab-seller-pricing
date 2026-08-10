import { useEffect, useRef, useState } from "react";
import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import { type HateoasLink } from "@khinemyaezin/seller-api";
import {
  PricingPayload,
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
  type PlatformEvents,
  type SellerPlatform,
} from "@khinemyaezin/seller-contracts";
import ProductPricingWidget from "./product-pricing-widget";

export type ProductPricingWidgetExposedProps = ExtensionMountProps & {
  entryLink: HateoasLink;
  platform?: SellerPlatform;
};

export type PricingWidgetHandle = {
  validate: () => Promise<{
    value?: PricingPayload;
    errors?: Record<string, string>;
  }>;
};

function resolveHydrateSnapshot(
  events: PlatformEvents,
  instanceId: string,
): PricingPayload | undefined {
  const snap = events.getSnapshot("extension:pricing:hydrate:v1", instanceId);
  return snap?.payload as PricingPayload | undefined;
}

export default function ProductPricingWidgetExposed({
  instanceId,
  slotId = PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  context,
  platform,
  entryLink,
}: ProductPricingWidgetExposedProps) {
  const events = platform?.events;
  const ref = useRef<PricingWidgetHandle>(null);
  const producerId = instanceId;
  const [payload, setPayload] = useState<Partial<PricingPayload>>((context as PricingPayload));

  useEffect(() => {
    if (!instanceId) return;
    if (!events) return;

    const snapshot = resolveHydrateSnapshot(events, instanceId);
    if (snapshot) {
      setPayload(snapshot);
    }

    const unsubs = [
      events.subscribe("extension:validate:v1", async (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.instanceId !== instanceId) return;
        if (msg.slotId && msg.slotId !== slotId) return;

        const payload = await ref.current?.validate();

        events.emit("extension:validated:v1", {
          producerId,
          instanceId,
          slotId,
          valid: payload ? !payload.errors : false,
          ...(payload?.errors
            ? { errors: payload.errors, payload: undefined }
            : { payload: payload?.value }),
        });
      }),
      events.subscribe("extension:pricing:hydrate:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.instanceId && msg.instanceId !== instanceId) return;
        if (msg.slotId && msg.slotId !== slotId) return;

        if (msg.payload) {
          setPayload(msg.payload as Partial<PricingPayload>);
        }
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [events, instanceId, slotId, producerId]);

  const onChange = (payload: PricingPayload) => {
    events?.setState("extension:pricing:updated:v1", {
      producerId,
      instanceId,
      slotId,
      payload,
    });
  };

  if (!entryLink || !instanceId) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <ProductPricingWidget
          ref={ref}
          value={payload}
          onChange={onChange}
        />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
