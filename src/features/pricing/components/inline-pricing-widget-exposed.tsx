import { useEffect, useId, useRef, useState } from "react";
import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import {
  PricingCreateContext,
  PricingPayload,
  PRODUCT_EXTENSION_SLOTS,
  type ExtensionMountProps,
  type PlatformEvents,
} from "@khinemyaezin/seller-contracts";
import InlinePricingWidget from "./inline-pricing-widget";

export type InlinePricingWidgetExposedProps = ExtensionMountProps;

export type InlinePricingWidgetHandle = {
  validate: () => Promise<{
    value?: PricingPayload;
    errors?: Record<string, string>;
  }>;
  getValues: () => PricingPayload;
};

function mergeFromHydrate<T extends object>(
  prev: T | undefined,
  current: T | undefined,
  context: Partial<T> | undefined,
): T {
  return { ...prev, ...current, ...context } as T;
}

function resolveMountSnapshot(
  events: PlatformEvents,
  groupId: string,
) {
  const payload = events.getSnapshot("extension:pricing:new:updated:v1", groupId)
    ?.payload as PricingPayload | undefined;
  const context = events.getSnapshot("extension:pricing:new:hydrate:v1", groupId)
    ?.payload as PricingCreateContext | undefined;
  return { payload, context };
}

export default function InlinePricingWidgetExposed({
  groupId,
  slotId = PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE,
  context,
  platform,
  entryLink,
}: InlinePricingWidgetExposedProps) {
  const events = platform?.events;
  const ref = useRef<InlinePricingWidgetHandle>(null);
  const producerId = useId();
  const [payload, setPayload] = useState<PricingPayload>();
  const [ctx, setContext] = useState<PricingCreateContext>();

  useEffect(() => {
    if (!groupId) return;
    if (!events) return;

    const snapshot = resolveMountSnapshot(events, groupId);
    const current = ref.current?.getValues();
    if (snapshot.payload || snapshot.context) {
      setPayload((prev) => mergeFromHydrate(prev, current, { ...snapshot.payload, ...snapshot.context }));
    }
    if (snapshot.context) {
      setContext((prev) => ({ ...prev, ...snapshot.context } as PricingCreateContext));
    }

    const unsubs = [
      events.subscribe("extension:validate:v1", async (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId !== groupId) return;
        if (msg.slotId && msg.slotId !== slotId) return;

        const validatedPayload = await ref.current?.validate();

        events.emit("extension:validated:v1", {
          producerId,
          groupId,
          slotId,
          valid: validatedPayload ? !validatedPayload.errors : false,
          ...(validatedPayload?.errors
            ? { errors: validatedPayload.errors, payload: undefined }
            : { payload: validatedPayload?.value }),
        });
      }),
      events.subscribe("extension:pricing:new:hydrate:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId && msg.groupId !== groupId) return;
        if (msg.slotId && msg.slotId !== slotId) return;
        if (!msg.payload) return;

        setContext(msg.payload);
        setPayload((prev) => mergeFromHydrate(prev, ref.current?.getValues(), msg.payload));

      }),
      events.subscribe("extension:pricing:new:updated:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId !== groupId) return;
        if (!msg.payload) return;

        setPayload(msg.payload);
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [events, groupId, slotId, producerId]);

  const onChange = (payload: PricingPayload) => {
    events?.setState("extension:pricing:new:updated:v1", {
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
        <InlinePricingWidget
          ref={ref}
          context={ctx}
          value={payload}
          onChange={onChange} />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
