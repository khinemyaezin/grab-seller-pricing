import {
  Field,
  FieldError,
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
import { InlinePricingWidgetHandle } from "./inline-pricing-widget-exposed";
import { useDebounce } from "@khinemyaezin/seller-ui";

export type InlinePricingWidgetProps = {
  context?: PricingCreateContext;
  value?: PricingPayload;
  onChange: (value: PricingPayload) => void;
  ref: Ref<InlinePricingWidgetHandle>;
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

export default function InlinePricingWidget({
  context,
  value,
  onChange,
  ref,
}: InlinePricingWidgetProps) {
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
    <Field data-invalid={!!errors.amount} className="gap-1">
      <input type="hidden" {...register("sku")} />
      <input type="hidden" {...register("currencyCode")} />
      <InputGroup>
        <InputGroupInput
          id="inline-pricing-amount"
          type="number"
          min={0}
          step="any"
          aria-label="Price amount"
          {...register("amount", { valueAsNumber: true })}
        />
        <InputGroupAddon align="inline-end">{watch("currencyCode")}</InputGroupAddon>
      </InputGroup>
      {errors.amount ? <FieldError errors={[errors.amount]} /> : null}
    </Field>
  );
}
