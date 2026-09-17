import "server-only";

export const GET_STOREFRONT_CONTENT = /* GraphQL */ `
  query GetStorefrontContent {
    categoryCollection(where: { active: true }, order: position_ASC, limit: 100) {
      total
      items {
        sys {
          id
        }
        titleSR: titleSr
        titleEN: titleEn
        titleHU: titleHu
        titleDE: titleDe
        titleRU: titleRu
        slug
        position
        active
        image {
          url
          title
          description
          width
          height
        }
      }
    }
    productCollection(where: { active: true }, order: position_ASC, limit: 500) {
      total
      items {
        sys {
          id
        }
        titleSR: titleSr
        titleEN: titleEn
        titleHU: titleHu
        titleDE: titleDe
        titleRU: titleRu
        descriptionSR: descriptionSr
        descriptionEN: descriptionEn
        descriptionHU: descriptionHu
        descriptionDE: descriptionDe
        descriptionRU: descriptionRu
        slug
        price
        compareAtPrice
        position
        active
        available
        featured
        onSale
        image {
          url
          title
          description
          width
          height
        }
        category {
          sys {
            id
          }
          slug
        }
      }
    }
  }
`;
