import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';

export enum McsHttpStatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Unprocessable = 422,
  InternalServerError = 500,
  ServiceUnavailable = 503
}

/**
 * Enumeration serializer and deserializer methods
 */
export class McsHttpStatusCodeSerialization
  extends McsEnumSerializationBase<McsHttpStatusCode> {
  constructor() { super(McsHttpStatusCode); }
}
