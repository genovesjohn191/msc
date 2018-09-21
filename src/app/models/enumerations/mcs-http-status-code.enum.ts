import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum McsHttpStatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Unprocessable = 422,
  ReadOnlyMode = 423,
  InternalServerError = 500,
  ServiceUnavailable = 503
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsHttpStatusCodeSerialization')
export class McsHttpStatusCodeSerialization
  extends McsEnumSerializationBase<McsHttpStatusCode> {
  constructor() { super(McsHttpStatusCode); }
}
