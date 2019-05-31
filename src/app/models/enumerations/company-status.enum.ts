import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum CompanyStatus {
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
@CacheKey('CompanyStatusSerialization')
export class CompanyStatusSerialization
  extends McsEnumSerializationBase<CompanyStatus> {
  constructor() { super(CompanyStatus); }
}
