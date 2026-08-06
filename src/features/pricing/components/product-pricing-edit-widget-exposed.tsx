import { EntryLinkProvider, PlatformProvider } from "@khinemyaezin/seller-ui";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import type { ProductEditPricingSlotProps } from "@khinemyaezin/seller-contracts";
import ProductPricingEditWidget from "./product-pricing-edit-widget";

export default function ProductPricingEditWidgetExposed({
  productId,
  variantId,
  sku,
  platform,
  entryLink,
  onSaved,
  onError,
}: ProductEditPricingSlotProps & { entryLink: HateoasLink }) {
  if (!entryLink) return null;

  return (
    <PlatformProvider platform={platform}>
      <EntryLinkProvider link={entryLink}>
        <ProductPricingEditWidget
          productId={productId}
          variantId={variantId}
          sku={sku}
          platform={platform}
          entryLink={entryLink}
          onSaved={onSaved}
          onError={onError}
        />
      </EntryLinkProvider>
    </PlatformProvider>
  );
}
