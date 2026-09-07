import {
    PricingCreateContext,
    PricingPayload,
    type SlotHandle,
} from "@khinemyaezin/seller-contracts";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    mergeFromHydrate,
    useRegisterSlotHandle,
    type SlotWidgetHandle,
} from "@khinemyaezin/seller-ui";

export type UsePricingNewSlotProps = {
    groupId: string;
    slotId: string;
    context?: PricingCreateContext;
    initialValue?: PricingPayload;
    onChange?: (value: PricingPayload) => void;
    registerHandle?: (handle: SlotHandle<PricingPayload>) => void | (() => void);
};

export type PricingWidgetHandle = SlotWidgetHandle<PricingPayload>;

export function usePricingNewSlot({
    context,
    initialValue,
    onChange,
    registerHandle,
}: UsePricingNewSlotProps) {
    const ref = useRef<PricingWidgetHandle>(null);
    const [payload, setPayload] = useState<PricingPayload | undefined>(initialValue);
    const payloadRef = useRef(payload);
    payloadRef.current = payload;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useRegisterSlotHandle(ref, registerHandle);

    const sku = context?.sku;

    useEffect(() => {
        if (sku === undefined) return;
        const prev = payloadRef.current;
        if (prev?.sku === sku) return;

        const next = mergeFromHydrate(prev, ref.current?.getValues(), { sku });
        payloadRef.current = next;
        setPayload(next);
        onChangeRef.current?.(next);
    }, [sku]);

    const handleChange = useCallback((next: PricingPayload) => {
        payloadRef.current = next;
        setPayload(next);
        onChangeRef.current?.(next);
    }, []);

    return { context, payload, ref, onChange: handleChange };
}
