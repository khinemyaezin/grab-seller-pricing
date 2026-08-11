import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@khinemyaezin/seller-ui/components/field";
import {
  PricingPayload,
  PricingPayloadSchema,
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
import { PricingWidgetHandle } from "./product-pricing-widget-exposed";

export type ProductPricingWidgetProps = {
  value?: Partial<PricingPayload>;
  onChange: (value: PricingPayload) => void,
  ref: Ref<PricingWidgetHandle>
};

const DEFAULT_CURRENCY = "USD";
const DEFAULT_VALUE: PricingPayload = {
  sku: "",
  currencyCode: DEFAULT_CURRENCY,
  amount: 0
}

const schema = z.fromJSONSchema(PricingPayloadSchema) as z.ZodType<PricingPayload, PricingPayload>;

export default function ProductPricingWidget({ value, onChange, ref }: ProductPricingWidgetProps) {
  const form = useForm<PricingPayload>({
    defaultValues: DEFAULT_VALUE,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const { reset, register, watch, formState: { errors } } = form;

  useEffect(() => {
    if (value) {
      reset({ ...DEFAULT_VALUE, ...value })
    }
  }, [value]);

  const emitChange = useCallback(async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onChange(form.getValues());
    }
  }, [form, onChange]);

  useEffect(() => {
    const subscription = watch(() => {
      emitChange();
    });
    return () => subscription.unsubscribe();
  }, [watch, emitChange]);

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
    };
  }, [form]);

  return (
    <FieldGroup className="grid gap-4">
      <div className="grid gap-3">
        <Field data-invalid={!!errors.amount}>
          <FieldLabel htmlFor={`pricing-amount`}>Amount</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={`pricing-amount`}
              type="number"
              {...register("amount", { valueAsNumber: true })}
            />
            <InputGroupAddon align="inline-end">
              {DEFAULT_CURRENCY}
            </InputGroupAddon>
          </InputGroup>
          {errors.amount && (
            <FieldError errors={[errors.amount]} />
          )}
        </Field>
      </div>
    </FieldGroup>
  );
}
