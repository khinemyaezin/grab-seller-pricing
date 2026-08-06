import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@khinemyaezin/seller-ui/components/field";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import type { SellerPlatform } from "@khinemyaezin/seller-contracts";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@khinemyaezin/seller-ui/components/input-group";

const DEFAULT_CURRENCY = "USD";

export type PricingLineValue = {
  sku: string;
  title?: string;
  currencyCode: string;
  amount: number | "";
  minQuantity?: number | null;
  maxQuantity?: number | null;
};

export type PricingFieldName = "amount" | "currencyCode";

export type ProductPricingWidgetProps = {
  sku: string;
  value: PricingLineValue;
  onChange: (next: PricingLineValue) => void;
  errors?: Partial<Record<PricingFieldName, string>>;
  onBlur?: (field: PricingFieldName) => void;
  platform?: SellerPlatform;
  entryLink: HateoasLink;
};

export default function ProductPricingWidget({
  sku,
  value,
  onChange,
  errors,
  onBlur,
}: ProductPricingWidgetProps) {
  const amount = value?.amount ?? "";
  const amountError = errors?.amount;
  const fieldId = sku?.trim() || value?.sku || "line";

  return (
    <FieldGroup className="grid gap-4">
      <div className="grid gap-3">
        <Field data-invalid={!!amountError}>
          <FieldLabel htmlFor={`pricing-${fieldId}-amount`}>Amount</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={`pricing-${fieldId}-amount`}
              type="number"
              min={0}
              step="0.01"
              value={amount}
              placeholder="0.00"
              onChange={(event) => {
                const raw = event.target.value;
                onChange({
                  ...value,
                  sku: sku?.trim() || value.sku || "",
                  amount: raw === "" ? "" : Number(raw),
                });
              }}
              onBlur={() => onBlur?.("amount")}
              aria-invalid={!!amountError}
            />
            <InputGroupAddon align="inline-end">{DEFAULT_CURRENCY}</InputGroupAddon>
          </InputGroup>
          {amountError ? <FieldError>{amountError}</FieldError> : null}
        </Field>
      </div>
    </FieldGroup>
  );
}
