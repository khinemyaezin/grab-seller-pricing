import { PricingCreateContext, PricingPayload, SellerPlatform } from "@khinemyaezin/seller-contracts";
import { useRef, useId, useState, useEffect } from "react";
import { PricingWidgetHandle } from "../components/product-pricing-widget-exposed";

export type UsePricingNewSlotProps = {
    platform?: SellerPlatform;
    groupId: string;
    slotId: string;
    initialContext: PricingCreateContext
}

function mergeFromHydrate<T extends object>(
    prev: T | undefined,
    current: T | undefined,
    context: Partial<T> | undefined,
): T {
    return { ...prev, ...current, ...context } as T;
}

export function usePricingNewSlot({ platform, groupId, slotId, initialContext }: UsePricingNewSlotProps) {
    const events = platform?.events;
    const ref = useRef<PricingWidgetHandle>(null);
    const producerId = useId();

    const [context, setContext] = useState<PricingCreateContext | undefined>(
        () => (initialContext as PricingCreateContext) ??
            events?.getSnapshot("extension:pricing:new:hydrate:v1", groupId)?.payload
    );

    const [payload, setPayload] = useState<PricingPayload | undefined>(
        () => events?.getSnapshot("extension:pricing:new:updated:v1", groupId)?.payload
    );

    useEffect(() => {
        if (!groupId) return;
        if (!events) return;

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

                setContext((prev) => ({ ...prev, ...msg.payload }));
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

    return { context, payload, ref, onChange };
}