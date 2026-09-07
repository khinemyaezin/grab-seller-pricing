import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PricingEditContext,
  PricingEditPayload,
  SlotHandle,
} from "@khinemyaezin/seller-contracts";
import { useVariantPriceSet } from "./use-variant-price";
import type { PricingEditWidgetHandle } from "../components/pricing-edit-widget";
import { useRegisterSlotHandle } from "@khinemyaezin/seller-ui";

export type UsePricingEditSlotProps = {
  groupId: string;
  slotId?: string;
  context?: PricingEditContext;
  initialValue?: PricingEditPayload;
  onChange?: (value: PricingEditPayload) => void;
  registerHandle?: (handle: SlotHandle<PricingEditPayload>) => void | (() => void);
};

export function usePricingEditSlot({
  context,
  initialValue,
  onChange,
  registerHandle,
}: UsePricingEditSlotProps) {
  const ref = useRef<PricingEditWidgetHandle>(null);
  const [payload, setPayload] = useState<PricingEditPayload | undefined>(initialValue);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const seededForVariantRef = useRef<string | undefined>(undefined);

  const { price, priceSetId, sku, isLoading } = useVariantPriceSet(context?.variantId);

  useRegisterSlotHandle(ref, registerHandle);

  const contextSku = context?.sku;
  const variantId = context?.variantId;

  useEffect(() => {
    if (contextSku === undefined) return;
    const prev = payloadRef.current;
    if (prev?.sku === contextSku) return;

    const current = ref.current?.getValues() ?? prev;
    if (!current) return;

    const next = { ...current, sku: contextSku };
    payloadRef.current = next;
    setPayload(next);
    onChangeRef.current?.(next);
  }, [contextSku]);

  const handleChange = useCallback((next: PricingEditPayload) => {
    payloadRef.current = next;
    setPayload(next);
    onChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    if (!variantId || !price) return;
    if (seededForVariantRef.current === variantId) return;
    seededForVariantRef.current = variantId;

    const next: PricingEditPayload = {
      sku: sku ?? contextSku ?? "",
      currencyCode: price.currencyCode,
      amount: price.amount,
      ...(priceSetId ? { priceSetId } : {}),
      ...(price.id ? { priceId: price.id } : {}),
    };

    handleChange(next);
  }, [variantId, price, priceSetId, sku, contextSku, handleChange]);

  return { context, payload, onChange: handleChange, ref, isLoading };
}
