import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@khinemyaezin/seller-ui/components/field";
import {
  PricingCreateContext,
  PricingPayload,
  PricingPayloadSchema,
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
import { Ref, useCallback, useEffect, useImperativeHandle } from "react";
import { useDebounce } from "@khinemyaezin/seller-ui";

export type ProductPricingWidgetHandle = SlotWidgetHandle<PricingPayload>;
export type PricingWidgetHandle = ProductPricingWidgetHandle;

export type ProductPricingWidgetProps = {
  context?: PricingCreateContext;
  initialValue?: PricingPayload;
  value?: PricingPayload;
  onChange: (value: PricingPayload) => void;
  ref: Ref<ProductPricingWidgetHandle>;
};

const DEFAULT_CURRENCY = "USD";
const DEFAULT_VALUE: PricingPayload = {
  sku: "",
  currencyCode: DEFAULT_CURRENCY,
  amount: 0,
};

const schema = z.fromJSONSchema(PricingPayloadSchema) as z.ZodType<
  PricingPayload,
  PricingPayload
>;

export default function ProductPricingWidget({
  context,
  initialValue,
  value,
  onChange,
  ref,
}: ProductPricingWidgetProps) {
  const form = useForm<PricingPayload>({
    defaultValues: initialValue ?? value ?? DEFAULT_VALUE,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const { reset, register, watch, setValue, getValues, formState: { errors } } = form;

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
        reset(DEFAULT_VALUE);
        onChange(DEFAULT_VALUE);
      },
    };
  }, [form, reset, onChange, getValues]);

  return (
    <FieldGroup className="grid gap-4">
      <input type="hidden" {...register("sku")} />
      <input type="hidden" {...register("currencyCode")} />
      <div className="grid gap-3">
        <Field data-invalid={!!errors.amount}>
          <FieldLabel htmlFor="pricing-amount">Amount</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="pricing-amount"
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
