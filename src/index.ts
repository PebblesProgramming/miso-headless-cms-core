// Client exports
export {
  CmsClient,
  createCmsClient,
  CmsApiError,
  CheckoutStockError,
} from './client/index.js';

// Media normalization utils + types (framework-agnostic; also on ./ui)
export { toMediaArray, firstMedia, isVideo } from './media.js';
export type { MediaItem, MediaObject, MediaInput } from './media.js';

// Shopping cart (framework-agnostic; ./ui adds the useCart hook)
export { createCart } from './cart.js';
export type { Cart, CartLine, CartOptions } from './cart.js';

// Type exports
export type {
  FieldType,
  SubFieldType,
  MediaAccept,
  SubFieldDefinition,
  FieldDefinition,
  ComponentDefinition,
  PageComponent,
  Page,
  FormFieldType,
  FormFieldOption,
  FormFieldValidation,
  FormFieldDefinition,
  FormSubmitResponse,
  MailingSubscribePayload,
  MailingSubscribeResponse,
  FormDefinition,
  ApiResponse,
  CmsClientConfig,
  CmsConfig,
  AgendaEventStatus,
  AgendaEvent,
  AgendaEventsParams,
  AgendaEventsResponse,
  Post,
  PostsParams,
  PostsResponse,
  SiteSettings,
  // Shop
  Product,
  ProductVariant,
  ProductCategory,
  ProductsParams,
  ProductsResponse,
  Address,
  CheckoutPayload,
  CheckoutResponse,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  StockShortage,
  OrderWebhookPayload,
} from './client/index.js';
