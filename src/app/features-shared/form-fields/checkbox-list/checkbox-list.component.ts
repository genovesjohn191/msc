import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import {
  McsCloudHealthOption,
  McsOption
} from '@app/models';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';

type McsOptionType = McsOption[] | McsCloudHealthOption[]

@Component({
  selector: 'mcs-checkbox-list',
  templateUrl: './checkbox-list.component.html',
  styleUrls: ['./checkbox-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'checkbox-list-wrapper'
  }
})

export class CheckBoxListComponent  extends FormFieldBaseComponent2<McsOptionType[]> {
  private _optionList: McsOptionType;
  public selectedOptions = [];

  @Input()
    public get optionList(): McsOptionType { return this._optionList; }
    public set optionList(value: McsOptionType) {
      if (this._optionList !== value) {
        this._optionList = value;
      }
    }

  @Input()
    public eventId: string;

  @Input()
    public eventTracker: string;

  @Input()
    public eventCategory: string;

  @Input()
    public eventLabel: string;

  public onSelected(optionList: McsOptionType[]): void {
    this.writeValue(optionList);
  }
}