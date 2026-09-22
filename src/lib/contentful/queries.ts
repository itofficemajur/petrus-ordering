import "server-only";
export const ASSET_FIELDS = `url title description width height`;
export const TITLE_FIELDS = `titleSR: titleSr titleEN: titleEn titleHU: titleHu titleDE: titleDe titleRU: titleRu`;
export const CATEGORY_FIELDS = `sys { id updatedAt: publishedAt } ${TITLE_FIELDS} slug position active image { ${ASSET_FIELDS} }`;
export const PRODUCT_FIELDS = `
 sys { id updatedAt: publishedAt } ${TITLE_FIELDS}
 descriptionSR: descriptionSr descriptionEN: descriptionEn descriptionHU: descriptionHu descriptionDE: descriptionDe descriptionRU: descriptionRu
 slugSR: slugSr slugEN: slugEn slugHU: slugHu slugDE: slugDe slugRU: slugRu
 price compareAtPrice position active available featured onSale
 image { ${ASSET_FIELDS} } category { ${CATEGORY_FIELDS} }
`;
export const PRODUCT_DETAIL_FIELDS = `${PRODUCT_FIELDS}
 sku noIndex noFollow socialImage { ${ASSET_FIELDS} }
 galleryCollection(limit: 30) { items { ${ASSET_FIELDS} } }
 allergenReferencesCollection(limit: 30) { items { sys { id } ${TITLE_FIELDS} } }
`;
export const GET_STOREFRONT_CONTENT = `query GetStorefrontContent {
 categoryCollection(where: {active: true}, order: position_ASC, limit: 100) { total items { ${CATEGORY_FIELDS} } }
 productCollection(where: {active: true}, order: position_ASC, limit: 500) { total items { ${PRODUCT_FIELDS} } }
}`;
