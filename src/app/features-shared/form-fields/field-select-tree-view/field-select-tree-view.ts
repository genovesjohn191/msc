import { TreeDatasource } from '@app/utilities';

import { IFormField } from '../abstraction/form-field.interface';

export interface IFieldSelectTreeView<TEntity> extends IFormField {
  multiple: boolean;
  expandFirst: boolean;
  hideChips: boolean;
  dataSource: TreeDatasource<TEntity>;
}
