import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import type { SellerPlatform } from "@khinemyaezin/seller-contracts";
import ProductPricingWidget, {
  type PricingFieldName,
  type PricingLineValue,
} from "./product-pricing-widget";

export default function ProductPricingWidgetExposed({
  sku,
  value,
  onChange,
  errors,
  onBlur,
  platform,
  entryLink,
}: {
  sku: string;
  value: PricingLineValue;
  onChange: (next: PricingLineValue) => void;
  errors?: Partial<Record<PricingFieldName, string>>;
  onBlur?: (field: PricingFieldName) => void;
  platform?: SellerPlatform;
  entryLink: HateoasLink;
}) {
  if (!entryLink) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <ProductPricingWidget
          sku={sku}
          value={value}
          onChange={onChange}
          errors={errors}
          onBlur={onBlur}
          platform={platform}
          entryLink={entryLink}
        />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
