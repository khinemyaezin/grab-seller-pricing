import { useMemo, type ReactNode } from "react";
import type {
  PricingEditContext,
  PricingEditPayload,
  SlotWidgetProps,
} from "@khinemyaezin/seller-contracts";
import { useVariantPriceSet } from "../hooks/use-variant-price";
import { PricingEditForm } from "./pricing-edit-form";

export type PricingEditFormContextProps = SlotWidgetProps<
  PricingEditContext,
  PricingEditPayload
> & {
  loadingFallback?: ReactNode;
  children: ReactNode;
};

export function PricingEditFormContext({
  context,
  initialValue,
  onChange,
  registerHandle,
  loadingFallback,
  children,
}: PricingEditFormContextProps) {
  const variantId = context?.variantId?.trim();
  const { price, priceSetId, sku, isLoading } = useVariantPriceSet(variantId);

  const formSeed: PricingEditPayload = useMemo(() => {
    if (initialValue) {
      return {
        ...initialValue,
        priceSetId: initialValue.priceSetId ?? priceSetId,
        priceId: initialValue.priceId ?? price?.id,
      };
    }
    return {
      sku: context?.sku ?? sku ?? "",
      currencyCode: price?.currencyCode || "USD",
      amount: price?.amount ?? 0,
      priceSetId,
      priceId: price?.id,
    };
  }, [variantId, price, priceSetId, context?.sku, sku]);

  if (isLoading && !initialValue && Boolean(variantId)) {
    return (
      loadingFallback ?? (
        <p className="text-sm text-muted-foreground">Loading price…</p>
      )
    );
  }

  
  return (
    <PricingEditForm
      seed={formSeed}
      contextSku={context?.sku}
      onValuesChange={onChange}
      registerHandle={registerHandle}
    >
      {children}
    </PricingEditForm>
  );
}
