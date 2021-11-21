import { McsOption } from '@app/models';

export class BillingOperationViewModel {

  constructor(
    public title: string,
    public items: McsOption[],
    public includeMininumCommentNote: boolean,
    public includeProjectionSuffix?: boolean
  ) { }
}
