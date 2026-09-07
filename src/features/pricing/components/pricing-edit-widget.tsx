import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@khinemyaezin/seller-ui/components/field";
import {
  PricingEditContext,
  PricingEditPayload,
  PricingEditPayloadSchema,
  type SlotWidgetHandle,
} from "@khinemyaezin/seller-contracts";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@khinemyaezin/seller-ui/components/input-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Ref, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useDebounce } from "@khinemyaezin/seller-ui";

import { useVariantPriceSet } from "../hooks/use-variant-price";

export type PricingEditWidgetHandle = SlotWidgetHandle<PricingEditPayload>;

export type PricingEditWidgetProps = {
  context?: PricingEditContext;
  initialValue?: PricingEditPayload;
  value?: PricingEditPayload;
  onChange: (value: PricingEditPayload) => void;
  isLoading?: boolean;
  ref: Ref<PricingEditWidgetHandle>;
};

const DEFAULT_CURRENCY = "USD";
const DEFAULT_VALUE: PricingEditPayload = {
  sku: "",
  currencyCode: DEFAULT_CURRENCY,
  amount: 0,
};

const schema = z.fromJSONSchema(PricingEditPayloadSchema) as z.ZodType<
  PricingEditPayload,
  PricingEditPayload
>;

export default function PricingEditWidget({
  context,
  initialValue,
  onChange,
  ref,
}: PricingEditWidgetProps) {
  const { price, sku, isLoading } = useVariantPriceSet(context?.variantId);

  const form = useForm<PricingEditPayload>({
    defaultValues: initialValue ?? DEFAULT_VALUE,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const { reset, register, watch, setValue, getValues, formState: { errors } } = form;

  const getBaseline = useCallback((): PricingEditPayload => {
    if (price) {
      return {
        sku: context?.sku ?? sku ?? initialValue?.sku ?? "",
        currencyCode: price.currencyCode || initialValue?.currencyCode || DEFAULT_CURRENCY,
        amount: price.amount,
      };
    }
    return initialValue ?? DEFAULT_VALUE;
  }, [price, sku, context?.sku, initialValue]);

  useEffect(() => {
    if (!price || initialValue) return;
    const baseline = getBaseline();
    reset(baseline);
    onChange(baseline);
  }, [price, initialValue, getBaseline, reset, onChange]);

  useEffect(() => {
    if (context?.sku) {
      setValue("sku", context.sku);
    }
  }, [context?.sku, setValue]);

  const emitChange = useCallback(async () => {
    onChange(getValues());
  }, [getValues, onChange]);

  const { debounceFn: debouncedEmitChange } = useDebounce(emitChange, 300);

  useEffect(() => {
    const subscription = watch((_next, { name }) => {
      if (name) {
        debouncedEmitChange();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedEmitChange]);

  useImperativeHandle(ref, () => {
    return {
      validate: async () => {
        const isValid = await form.trigger();
        if (isValid) {
          return { value: getValues() };
        }

        const formErrors: Record<string, string> = {};
        Object.entries(form.formState.errors).forEach(([key, err]) => {
          if (err?.message) {
            formErrors[key] = err.message as string;
          }
        });

        return { errors: formErrors };
      },
      getValues: () => getValues(),
      reset: () => {
        const baseline = getBaseline();
        reset(baseline);
        onChange(baseline);
      },
    };
  }, [form, reset, getBaseline, onChange, getValues]);

  if (isLoading && !price && !initialValue) {
    return <p className="text-sm text-muted-foreground">Loading price…</p>;
  }

  return (
    <FieldGroup className="grid gap-4">
      <input type="hidden" {...register("sku")} />
      <input type="hidden" {...register("currencyCode")} />
      <input type="hidden" {...register("priceSetId")} />
      <input type="hidden" {...register("priceId")} />
      <div className="grid gap-3">
        <Field data-invalid={!!errors.amount}>
          <FieldLabel htmlFor="pricing-edit-amount">Amount</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="pricing-edit-amount"
              type="number"
              min={0}
              step="any"
              {...register("amount", { valueAsNumber: true })}
            />
            <InputGroupAddon align="inline-end">
              {watch("currencyCode") || DEFAULT_CURRENCY}
            </InputGroupAddon>
          </InputGroup>
          {errors.amount ? <FieldError errors={[errors.amount]} /> : null}
        </Field>
      </div>
    </FieldGroup>
  );
}
