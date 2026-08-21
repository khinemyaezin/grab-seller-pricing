import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePlatform } from "@khinemyaezin/seller-ui";
import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingEditContext,
  type PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import { useVariantPriceSet } from "./use-variant-price";
import type { PricingEditWidgetHandle } from "../components/pricing-edit-widget";

export function usePricingEditSlot(
  groupId: string,
  slotId: string = PRODUCT_EXTENSION_SLOTS.EDIT_PRICING,
) {
  const platform = usePlatform();
  const events = platform?.events;
  const ref = useRef<PricingEditWidgetHandle>(null);
  const producerId = useId();
  const [payload, setPayload] = useState<PricingEditPayload>();
  const [context, setContext] = useState<PricingEditContext>();
  const seededForVariantRef = useRef<string | undefined>(undefined);

  const { price, priceSetId, sku, isLoading } = useVariantPriceSet(context?.variantId);

  useEffect(() => {
    if (!groupId || !events) return;

    const hydrate = events.getSnapshot("extension:pricing:edit:hydrate:v1", groupId);
    const updated = events.getSnapshot("extension:pricing:edit:updated:v1", groupId);
    if (hydrate?.payload) {
      setContext((prev) => ({ ...prev, ...hydrate.payload }));
    }
    if (updated?.payload) {
      setPayload((prev) => ({ ...prev, ...updated.payload }));
    }

    const unsubs = [
      events.subscribe("extension:validate:v1", async (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId !== groupId) return;
        if (msg.slotId && msg.slotId !== slotId) return;

        const validated = await ref.current?.validate();

        events.emit("extension:validated:v1", {
          producerId,
          groupId,
          slotId,
          valid: validated ? !validated.errors : false,
          ...(validated?.errors
            ? { errors: validated.errors, payload: undefined }
            : { payload: validated?.value }),
        });
      }),
      events.subscribe("extension:pricing:edit:hydrate:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId && msg.groupId !== groupId) return;
        if (msg.slotId && msg.slotId !== slotId) return;
        if (!msg.payload) return;

        setContext(msg.payload);
        setPayload((prev) => {
          const current = ref.current?.getValues() ?? prev;
          return current
            ? { ...current, sku: msg.payload.sku }
            : { sku: msg.payload.sku, currencyCode: "USD", amount: 0 };
        });
      }),
      events.subscribe("extension:pricing:edit:updated:v1", (msg) => {
        if (msg.producerId === producerId) return;
        if (msg.groupId !== groupId) return;
        if (!msg.payload) return;
        setPayload(msg.payload);
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [events, groupId, slotId, producerId]);

  useEffect(() => {
    if (!context?.variantId || !price) return;
    if (seededForVariantRef.current === context.variantId) return;
    seededForVariantRef.current = context.variantId;

    const next: PricingEditPayload = {
      sku: sku ?? context.sku,
      currencyCode: price.currencyCode,
      amount: price.amount,
      ...(priceSetId ? { priceSetId } : {}),
      ...(price.id ? { priceId: price.id } : {}),
    };

    setPayload(next);
    events?.setState("extension:pricing:edit:updated:v1", {
      producerId,
      groupId,
      slotId,
      payload: next,
    });
  }, [context, price, priceSetId, sku, events, producerId, groupId, slotId]);

  const onChange = useCallback((next: PricingEditPayload) => {
    events?.setState("extension:pricing:edit:updated:v1", {
      producerId,
      groupId,
      slotId,
      payload: next,
    });
  }, [events, producerId, groupId, slotId]);

  return { context, payload, onChange, ref, isLoading };
}
