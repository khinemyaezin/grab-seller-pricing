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
} from "@khinemyaezin/seller-contracts";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@khinemyaezin/seller-ui/components/input-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Ref, useCallback, useEffect, useImperativeHandle } from "react";
import { useDebounce } from "@khinemyaezin/seller-ui";

export type PricingEditWidgetHandle = {
  validate: () => Promise<{
    value?: PricingEditPayload;
    errors?: Record<string, string>;
  }>;
  getValues: () => PricingEditPayload;
};

export type PricingEditWidgetProps = {
  context?: PricingEditContext;
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
  value,
  onChange,
  isLoading,
  ref,
}: PricingEditWidgetProps) {
  const form = useForm<PricingEditPayload>({
    defaultValues: DEFAULT_VALUE,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const { reset, register, watch, formState: { errors } } = form;

  useEffect(() => {
    reset({ ...form.getValues(), ...value, sku: context?.sku ?? value?.sku ?? "" });
    void form.trigger();
  }, [context, value]);

  const emitChange = useCallback(async () => {
    onChange(form.getValues());
  }, [form, onChange]);

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
          return { value: form.getValues() };
        }

        const formErrors: Record<string, string> = {};
        Object.entries(form.formState.errors).forEach(([key, err]) => {
          if (err?.message) {
            formErrors[key] = err.message as string;
          }
        });

        return { errors: formErrors };
      },
      getValues: () => form.getValues(),
    };
  }, [form]);

  if (isLoading && !value) {
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
