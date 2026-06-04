// Client exports
export {
  CmsClient,
  createCmsClient,
} from './client/index.js';

// Media normalization utils + types (framework-agnostic; also on ./ui)
export { toMediaArray, firstMedia, isVideo } from './media.js';
export type { MediaItem, MediaObject, MediaInput } from './media.js';

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
} from './client/index.js';
