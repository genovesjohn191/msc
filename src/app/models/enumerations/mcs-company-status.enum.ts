import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum McsCompanyStatus {
  Internal = 0,
  Cancelling = 1,
  Cancelled = 2,
  Prospect = 3,
  NoLonger = 4,
  Subsidiary = 5,
  Customer = 6
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsCompanyStatusSerialization')
export class McsCompanyStatusSerialization
  extends McsEnumSerializationBase<McsCompanyStatus> {
  constructor() { super(McsCompanyStatus); }
}
