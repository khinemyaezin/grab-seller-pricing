import { useCallback, useEffect, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PricingEditPayloadSchema,
  type PricingEditPayload,
  type SlotHandle,
} from "@khinemyaezin/seller-contracts";
import { useSlotChangeEmitter } from "@khinemyaezin/seller-ui";
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
  seed?: PricingEditPayload;
  contextSku?: string;
  onValuesChange?: (values: PricingEditPayload) => void;
  registerHandle?: (handle: SlotHandle<PricingEditPayload>) => void | (() => void);
  children: ReactNode;
};

export function PricingEditForm({
  seed,
  contextSku,
  onValuesChange,
  registerHandle,
  children,
}: PricingEditFormProps) {
  const form = useForm<PricingEditPayload>({
    defaultValues: seed ?? DEFAULT_EDIT_VALUE,
    resolver: zodResolver(editSchema),
    mode: "onChange",
  });

  const { setValue, getValues } = form;

   useEffect(() => {
    if (contextSku !== undefined && getValues("sku") !== contextSku) {
      setValue("sku", contextSku, { shouldDirty: true });
    }
  }, [contextSku, setValue, getValues]);

  const getBaseline = useCallback((): PricingEditPayload => {
    return seed ?? DEFAULT_EDIT_VALUE;
  }, [seed]);

  useRhfSlotHandle(form, registerHandle, getBaseline, onValuesChange);

  const source = useRhfValueSource(form);
  useSlotChangeEmitter(source, onValuesChange);

  return (
    <FormProvider {...form}>
      <input type="hidden" {...form.register("sku")} />
      <input type="hidden" {...form.register("currencyCode")} />
      <input type="hidden" {...form.register("priceSetId")} />
      <input type="hidden" {...form.register("priceId")} />
      {children}
    </FormProvider>
  );
}
