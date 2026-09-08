import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PricingEditPayloadSchema,
  type PricingEditContext,
  type PricingEditPayload,
  type SlotHandle,
} from "@khinemyaezin/seller-contracts";
import { useSlotChangeEmitter } from "@khinemyaezin/seller-ui";
import { useVariantPriceSet } from "../hooks/use-variant-price";
import { useRhfSlotHandle, useRhfValueSource } from "../lib/from-rhf";

const editSchema = z.fromJSONSchema(PricingEditPayloadSchema) as z.ZodType<
  PricingEditPayload,
  PricingEditPayload
>;

const DEFAULT_EDIT_VALUE: PricingEditPayload = {
  sku: "",
  currencyCode: "USD",
  amount: 0,
};

export type PricingEditFormProps = {
  context?: PricingEditContext;
  defaultValues?: PricingEditPayload;
  onValuesChange?: (values: PricingEditPayload) => void;
  registerHandle?: (handle: SlotHandle<PricingEditPayload>) => void | (() => void);
  loadingFallback?: ReactNode;
  children: ReactNode;
};

export function PricingEditForm({
  context,
  defaultValues,
  onValuesChange,
  registerHandle,
  loadingFallback,
  children,
}: PricingEditFormProps) {
  const { price, sku, isLoading } = useVariantPriceSet(context?.variantId);
  const serverBaselineRef = useRef<PricingEditPayload | null>(null);
  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;

  const form = useForm<PricingEditPayload>({
    defaultValues: defaultValues ?? DEFAULT_EDIT_VALUE,
    resolver: zodResolver(editSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!price || serverBaselineRef.current) return;

    const baseline: PricingEditPayload = {
      sku: context?.sku ?? sku ?? defaultValues?.sku ?? "",
      currencyCode: price.currencyCode || defaultValues?.currencyCode || "USD",
      amount: price.amount,
      priceSetId: defaultValues?.priceSetId,
      priceId: defaultValues?.priceId,
    };
    serverBaselineRef.current = baseline;

    if (!defaultValues) {
      form.reset(baseline);
      onValuesChangeRef.current?.(baseline);
    }
  }, [price, sku, context?.sku, defaultValues, form]);

  const { setValue, getValues } = form;
  const contextSku = context?.sku;

  useEffect(() => {
    if (contextSku === undefined) return;
    if (getValues("sku") === contextSku) return;
    setValue("sku", contextSku, { shouldDirty: true });
  }, [contextSku, setValue, getValues]);

  const source = useRhfValueSource(form);
  useSlotChangeEmitter(source, onValuesChange);

  const getBaseline = useCallback((): PricingEditPayload => {
    return serverBaselineRef.current ?? defaultValues ?? DEFAULT_EDIT_VALUE;
  }, [defaultValues]);

  useRhfSlotHandle(form, registerHandle, getBaseline, onValuesChange);

  if (isLoading && !price && !defaultValues) {
    return (
      loadingFallback ?? (
        <p className="text-sm text-muted-foreground">Loading price…</p>
      )
    );
  }

  return (
    <FormProvider {...form}>
      <input type="hidden" {...form.register("priceSetId")} />
      <input type="hidden" {...form.register("priceId")} />
      {children}
    </FormProvider>
  );
}
