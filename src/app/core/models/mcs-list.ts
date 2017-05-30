import { McsListItem } from './mcs-list-item';

export class McsList {

  private _groupNames: string[];
  private _listDictionary: Map<string, McsListItem[]>;

  constructor() {
    this._groupNames = new Array();
    this._listDictionary = new Map<string, McsListItem[]>();
  }

  public push(groupName: string, listItem: McsListItem): void {
    let items = new Array<McsListItem>();

    if (this.getGroup(groupName)) {
      items = this.getGroup(groupName);
    } else {
      this._groupNames.push(groupName);
    }

    items.push(listItem);
    this._listDictionary.set(groupName, items);
  }

  public getGroup(groupName: string): McsListItem[] {
    let group: McsListItem[];

    if (this._listDictionary.has(groupName)) {
      group = this._listDictionary.get(groupName);
    }

    return group;
  }

  public getGroupNames(): string[] {
    return this._groupNames;
  }
}
