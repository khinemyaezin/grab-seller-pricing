import { useEffect, useId, useRef, useState } from "react";
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

function resolveMountSnapshot(
  events: PlatformEvents,
  groupId: string,
): Partial<PricingPayload> | undefined {
  const own = events.getSnapshot("extension:pricing:updated:v1", groupId)
    ?.payload as PricingPayload | undefined;
  const identity = events.getSnapshot("extension:pricing:hydrate:v1", groupId)
    ?.payload as Partial<PricingPayload> | undefined;
  if (!own && !identity) return undefined;
  return { ...own, ...identity };
}

export default function ProductPricingWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  context,
  platform,
  entryLink,
}: ProductPricingWidgetExposedProps) {
  const events = platform?.events;
  const ref = useRef<PricingWidgetHandle>(null);
  const producerId = useId();
  const [payload, setPayload] = useState<Partial<PricingPayload>>((context as PricingPayload));

  useEffect(() => {
    if (!groupId) return;
    if (!events) return;

    const snapshot = resolveMountSnapshot(events, groupId);
    if (snapshot) {
      setPayload((prev) => ({ ...prev, ...snapshot }));
    }

    const unsubs = [
      events.subscribe("extension:validate:v1", async (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId !== groupId) return;
        if (msg.slotId && msg.slotId !== slotId) return;

        const payload = await ref.current?.validate();

        events.emit("extension:validated:v1", {
          producerId,
          groupId,
          slotId,
          valid: payload ? !payload.errors : false,
          ...(payload?.errors
            ? { errors: payload.errors, payload: undefined }
            : { payload: payload?.value }),
        });
      }),
      events.subscribe("extension:pricing:hydrate:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId && msg.groupId !== groupId) return;
        if (msg.slotId && msg.slotId !== slotId) return;
        if (!msg.payload) return;

        setPayload((prev) => ({
          ...prev,
          ...(msg.payload as Partial<PricingPayload>),
        }));
      }),
      events.subscribe("extension:pricing:updated:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId !== groupId) return;
        if (!msg.payload) return;
        setPayload((prev) => ({
          ...prev,
          ...(msg.payload as Partial<PricingPayload>),
        }));
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [events, groupId, slotId, producerId]);

  const onChange = (payload: PricingPayload) => {
    events?.setState("extension:pricing:updated:v1", {
      producerId,
      groupId,
      slotId,
      payload,
    });
  };

  if (!entryLink || !groupId) return null;

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
