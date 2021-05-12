import { DialogResultAction } from './dialog-result-action';

export class DialogResult<TData> {
  constructor(
    public action: DialogResultAction,
    public data?: TData | null
  ) { }
}
