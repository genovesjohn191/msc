import { McsOption } from '@app/models';

export class BillingOperationViewModel {

  constructor(
    public title: string,
    public items: McsOption[],
    public includeMinimumCommentNote: boolean,
    public includeProjectionSuffix?: boolean
  ) { }
}
