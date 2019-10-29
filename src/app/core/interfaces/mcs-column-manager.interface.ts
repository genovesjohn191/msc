import { McsFilterInfo } from '@app/models';

export interface IMcsColumnManager {
  includeColumn(columnInfo: McsFilterInfo): boolean;
}
