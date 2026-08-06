import { api, type HateoasLink } from "@khinemyaezin/seller-api";
import type {
  PriceSetResponse,
  UpdatePriceRequest,
  VariantPriceSetLinksResponse,
} from "../types";

export const priceSetService = {
  listVariantPriceLinks: (link: HateoasLink, variantIds: string[], headers?: Record<string, string>) =>
    api.followLink<VariantPriceSetLinksResponse>(link, "GET", undefined, { variantIds: variantIds.join(",") }, headers),

  getPriceSet: (link: HateoasLink, headers?: Record<string, string>) =>
    api.followLink<PriceSetResponse>(link, "GET", undefined, undefined, headers),

  updatePrice: (
    link: HateoasLink,
    request: UpdatePriceRequest,
    headers?: Record<string, string>,
  ) => api.followLink<PriceSetResponse>(link, "PUT", request, undefined, headers),
};

