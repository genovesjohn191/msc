import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HttpStatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  NotAllowed = 405,
  Unprocessable = 422,
  ReadOnlyMode = 423,
  InternalServerError = 500,
  ServiceUnavailable = 503
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('HttpStatusCodeSerialization')
export class HttpStatusCodeSerialization
  extends McsEnumSerializationBase<HttpStatusCode> {
  constructor() { super(HttpStatusCode); }
}
