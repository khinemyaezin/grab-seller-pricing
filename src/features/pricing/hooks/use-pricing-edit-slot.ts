import { useCallback, useRef } from "react";
import type {
  PricingEditContext,
  PricingEditPayload,
  SlotHandle,
} from "@khinemyaezin/seller-contracts";
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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useRegisterSlotHandle(ref, registerHandle);

  const handleChange = useCallback((next: PricingEditPayload) => {
    onChangeRef.current?.(next);
  }, []);

  return { context, initialValue, ref, onChange: handleChange };
}

