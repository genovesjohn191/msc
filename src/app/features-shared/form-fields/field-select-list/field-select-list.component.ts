import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  ViewEncapsulation
} from '@angular/core';
import {
  PeriodicSchedule,
  periodicScheduleText,
  McsCloudHealthOption,
  McsOption
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';

@Component({
  selector: 'mcs-field-select-list',
  templateUrl: './field-select-list.component.html',
  styleUrls: ['./field-select-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'field-select-list-dropdown-wrapper'
  }
})

export class FieldSelectListComponent extends FormFieldBaseComponent2<McsCloudHealthOption[]> {
  @Input()
  public get optionList(): McsCloudHealthOption { return this._optionList; }
  public set optionList(value: McsCloudHealthOption) {
    if (this._optionList !== value) {
      this._optionList = value;
      this._option = [];
    }
  }

  @Input()
    public get dropdownOptions(): McsOption { return this._dropdownOptions; }
    public set dropdownOptions(value: McsOption) {
      if (this._dropdownOptions !== value) {
        this._dropdownOptions = value;
      }
    }

  private _optionList: McsCloudHealthOption;
  private _dropdownOptions: McsOption;
  private _option: McsCloudHealthOption[] = [];

  constructor(_injector: Injector) {
    super(_injector);
  }

  public onSelectChange(event, option: McsCloudHealthOption): void {
    if (!isNullOrEmpty(event)) {
      this._option.push({
        text: event?.text,
        subText: option?.subText,
        alertType: option?.alertType,
        config: option?.config,
        actionLabel: option?.actionLabel
      });

      let removeDuplicateName = [...new Map(this._option.map(item => [item['config']?.name, item])).values()]
      // remove options with No Change
      this._option = removeDuplicateName.filter((data) => data?.text !== periodicScheduleText[PeriodicSchedule.NoChange]);
      this.writeValue(this._option);
    }
  }
}