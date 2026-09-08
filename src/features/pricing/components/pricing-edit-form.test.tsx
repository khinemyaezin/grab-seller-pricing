import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PricingEditPayload, SlotHandle } from "@khinemyaezin/seller-contracts";
import { PricingEditForm } from "./pricing-edit-form";
import { PricingFields } from "./pricing-fields";
import { useVariantPriceSet } from "../hooks/use-variant-price";

vi.mock("../hooks/use-variant-price", () => ({
  useVariantPriceSet: vi.fn(),
}));

const mockedUseVariantPriceSet = vi.mocked(useVariantPriceSet);

const DRAFT: PricingEditPayload = {
  sku: "DRAFT-SKU",
  currencyCode: "USD",
  amount: 42,
  priceSetId: "ps-draft",
  priceId: "p-draft",
};

const CONTEXT = { sku: "SKU-1", variantId: "var-1" };

function priceSet(
  overrides?: {
    amount?: number;
    currencyCode?: string;
    sku?: string;
    isLoading?: boolean;
    price?: ReturnType<typeof useVariantPriceSet>["price"];
  },
): ReturnType<typeof useVariantPriceSet> {
  return {
    price:
      overrides && "price" in overrides
        ? overrides.price
        : {
            id: "price-1",
            currencyCode: overrides?.currencyCode ?? "EUR",
            amount: overrides?.amount ?? 99,
          },
    sku: overrides?.sku ?? "API-SKU",
    isLoading: overrides?.isLoading ?? false,
    priceSetId: "ps-api",
    updatePriceLink: undefined,
    refetch: vi.fn(),
  };
}

describe("PricingEditForm", () => {
  beforeEach(() => {
    mockedUseVariantPriceSet.mockReset();
  });

  it("keeps a host draft and does not overwrite it from the API", () => {
    const onValuesChange = vi.fn();
    mockedUseVariantPriceSet.mockReturnValue(priceSet());

    let handle: SlotHandle<PricingEditPayload> | undefined;
    render(
      <PricingEditForm
        context={CONTEXT}
        defaultValues={DRAFT}
        onValuesChange={onValuesChange}
        registerHandle={(next) => {
          handle = next;
        }}
      >
        <PricingFields />
      </PricingEditForm>,
    );

    expect(screen.getByLabelText("Amount")).toHaveValue(42);
    expect(handle?.getValues()).toMatchObject({
      amount: 42,
      currencyCode: "USD",
      priceSetId: "ps-draft",
      priceId: "p-draft",
    });
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("hydrates once from the API when there is no host draft", () => {
    const onValuesChange = vi.fn();
    mockedUseVariantPriceSet.mockReturnValue(priceSet({ amount: 99 }));

    const { rerender } = render(
      <PricingEditForm context={CONTEXT} onValuesChange={onValuesChange}>
        <PricingFields />
      </PricingEditForm>,
    );

    expect(screen.getByLabelText("Amount")).toHaveValue(99);
    expect(onValuesChange).toHaveBeenCalledTimes(1);
    expect(onValuesChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: "SKU-1",
        currencyCode: "EUR",
        amount: 99,
      }),
    );

    mockedUseVariantPriceSet.mockReturnValue(priceSet({ amount: 200 }));
    rerender(
      <PricingEditForm context={CONTEXT} onValuesChange={onValuesChange}>
        <PricingFields />
      </PricingEditForm>,
    );

    expect(screen.getByLabelText("Amount")).toHaveValue(99);
    expect(onValuesChange).toHaveBeenCalledTimes(1);
  });
});
