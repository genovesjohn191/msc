import { McsOption } from './mcs-option';

export class McsOptionGroup {
  public groupName: string;
  public options: McsOption[];

  constructor(_groupName: string, ..._options: McsOption[]) {
    this.groupName = _groupName;
    this.options = _options;
  }
}
