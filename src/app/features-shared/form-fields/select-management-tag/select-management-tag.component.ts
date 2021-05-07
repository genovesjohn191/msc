import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  ViewEncapsulation
} from '@angular/core';
import {
  ManagementTag,
  managementTagText,
  McsCloudHealthOption
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';

@Component({
  selector: 'mcs-select-management-tag',
  templateUrl: './select-management-tag.component.html',
  styleUrls: ['./select-management-tag.component.scss', './../form-fields.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'management-tag-dropdown-wrapper'
  }
})

export class SelectManagementTagComponent extends FormFieldBaseComponent2<McsCloudHealthOption[]> {
  @Input()
  public get managementTagList(): McsCloudHealthOption { return this._managementTagList; }
  public set managementTagList(value: McsCloudHealthOption) {
    if (this._managementTagList !== value) {
      this._managementTagList = value;
      this._managementTags = [];
    }
  }

  @Input()
    public get dropdownList(): McsCloudHealthOption { return this._dropdownList; }
    public set dropdownList(value: McsCloudHealthOption) {
      if (this._dropdownList !== value) {
        this._dropdownList = value;
      }
    }

  private _managementTagList: McsCloudHealthOption;
  private _dropdownList: McsCloudHealthOption;
  private _managementTags: McsCloudHealthOption[] = [];

  constructor(_injector: Injector) {
    super(_injector);
  }

  public onSelectChange(event, option: McsCloudHealthOption): void {
    if (!isNullOrEmpty(event)) {
      this._managementTags.push({
        text: event?.text,
        subText: option?.subText,
        alertType: option?.alertType,
        config: option?.config
      });

      let removeDuplicateName = [...new Map(this._managementTags.map(item => [item['config']?.name, item])).values()]
      // remove management tags with No Change type
      this._managementTags = removeDuplicateName.filter((data) => data?.text !== managementTagText[ManagementTag.NoChange]);
      this.writeValue(this._managementTags);
    }
  }
}