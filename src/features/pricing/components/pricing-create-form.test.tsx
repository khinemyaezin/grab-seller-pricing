import { describe, expect, it, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { PricingPayload, SlotHandle } from "@khinemyaezin/seller-contracts";
import { PricingCreateForm } from "./pricing-create-form";
import { PricingFields } from "./pricing-fields";

const INITIAL: PricingPayload = {
  sku: "SKU-1",
  currencyCode: "USD",
  amount: 10,
};

describe("PricingCreateForm", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps live form values when later defaultValues change", () => {
    let handle: SlotHandle<PricingPayload> | undefined;
    const { rerender } = render(
      <PricingCreateForm
        defaultValues={INITIAL}
        registerHandle={(next) => {
          handle = next;
        }}
      >
        <PricingFields />
      </PricingCreateForm>,
    );

    const amount = screen.getByLabelText("Amount");
    fireEvent.change(amount, { target: { value: "20" } });

    expect(handle?.getValues().amount).toBe(20);

    rerender(
      <PricingCreateForm
        defaultValues={{ sku: "SKU-CHANGED", currencyCode: "EUR", amount: 99 }}
        registerHandle={(next) => {
          handle = next;
        }}
      >
        <PricingFields />
      </PricingCreateForm>,
    );

    expect(handle?.getValues()).toEqual({
      sku: "SKU-1",
      currencyCode: "USD",
      amount: 20,
    });
    expect(amount).toHaveValue(20);
  });

  it("emits after context sku is written onto the form", () => {
    vi.useFakeTimers();
    const onValuesChange = vi.fn();

    const { rerender } = render(
      <PricingCreateForm
        context={{ sku: "SKU-1" }}
        defaultValues={INITIAL}
        onValuesChange={onValuesChange}
      >
        <PricingFields />
      </PricingCreateForm>,
    );

    expect(onValuesChange).not.toHaveBeenCalled();

    rerender(
      <PricingCreateForm
        context={{ sku: "SKU-2" }}
        defaultValues={INITIAL}
        onValuesChange={onValuesChange}
      >
        <PricingFields />
      </PricingCreateForm>,
    );

    expect(onValuesChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onValuesChange).toHaveBeenCalledTimes(1);
    expect(onValuesChange).toHaveBeenCalledWith(
      expect.objectContaining({ sku: "SKU-2", amount: 10 }),
    );
  });

  it("reset restores mounted values and keeps the current sku", () => {
    let handle: SlotHandle<PricingPayload> | undefined;
    const registerHandle = (next: SlotHandle<PricingPayload>) => {
      handle = next;
    };

    const { rerender } = render(
      <PricingCreateForm
        context={{ sku: "SKU-1" }}
        defaultValues={INITIAL}
        registerHandle={registerHandle}
      >
        <PricingFields />
      </PricingCreateForm>,
    );

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "50" },
    });

    rerender(
      <PricingCreateForm
        context={{ sku: "SKU-2" }}
        defaultValues={INITIAL}
        registerHandle={registerHandle}
      >
        <PricingFields />
      </PricingCreateForm>,
    );

    expect(handle?.getValues().sku).toBe("SKU-2");

    act(() => {
      handle?.reset?.();
    });

    expect(handle?.getValues()).toEqual({
      sku: "SKU-2",
      currencyCode: "USD",
      amount: 10,
    });
  });
});
