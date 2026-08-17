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
import { PricingWidgetHandle } from "../hooks/use-pricing-new-slot";

export type ProductPricingWidgetProps = {
  context?: PricingCreateContext;
  value?: PricingPayload;
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

export default function ProductPricingWidget({ context, value, onChange, ref }: ProductPricingWidgetProps) {
  const form = useForm<PricingPayload>({
    defaultValues: DEFAULT_VALUE,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const { reset, register, watch, formState: { errors } } = form;

  useEffect(() => {
    reset({ ...form.getValues(), ...value, ...context });
    form.trigger();
  }, [context, value]);

  const emitChange = useCallback(async () => {
    onChange(form.getValues());
  }, [form, onChange]);

  const { debounceFn: debouncedEmitChange } = useDebounce(emitChange, 300);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
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
