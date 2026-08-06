import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveLink, resolveUrlTemplate, type HateoasLink } from "@khinemyaezin/seller-api";
import {
  priceSetService,
} from "../api/price-set-service";
import type { PriceSetResponse, UpdatePriceRequest } from "../types";
import { usePricingLink, usePricingRoot } from "./use-pricing-root";

export function useVariantPriceLinkGet(link?: HateoasLink, variantId?: string) {
  return useQuery({
    queryKey: ["variant-price-links", variantId],
    queryFn: async () => {
      const response = await priceSetService.listVariantPriceLinks(link!, [variantId!]);
      return response?._embedded?.find((item) => item.variantId === variantId) ?? null;
    },
    enabled: !!link && !!variantId,
    staleTime: 1000 * 60,
  });
}

export function usePriceSetLinkGet(getPriceSetLink?: HateoasLink, variantId?: string) {
  return useQuery({
    queryKey: ["price-set", getPriceSetLink?.href, variantId],
    queryFn: () => priceSetService.getPriceSet(getPriceSetLink!),
    enabled: !!getPriceSetLink,
    staleTime: 1000 * 60,
  });
}

export function useVariantPriceSet(variantId: string) {
  const root = usePricingRoot();
  const listLink = usePricingLink("listVariantPriceLinks");
  const priceSetByVariantId = useVariantPriceLinkGet(listLink, variantId);
  const getPriceSetLink = resolveLink(priceSetByVariantId?.data?._links, "get-price-set");
  const priceSetQuery = usePriceSetLinkGet(getPriceSetLink, variantId);
  const updatePriceLink = resolveLink(priceSetByVariantId.data?._links, "update-price")

  // multiple prices updates not supported yet
  const price = priceSetQuery.data?.prices?.[0];

  return {
    price,
    updatePriceLink,
    refetch: priceSetQuery.refetch,
  };
}

export function useUpdatePriceMutation() {
  const queryClient = useQueryClient();

  return useMutation<PriceSetResponse, Error, { link: HateoasLink; priceId: string, request: UpdatePriceRequest }>({
    mutationFn: ({ link, priceId, request }) => {
      const url = resolveUrlTemplate({ "priceId": priceId }, link);
      return priceSetService.updatePrice(url, request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-set"] });
    },
  });
}
