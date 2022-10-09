import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';
import {
  McsCloudHealthOption,
  McsOption
} from '@app/models';
import { 
  getSafeProperty,
  Guid,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  shareReplay
} from 'rxjs';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';

type McsOptionType = McsOption[] | McsCloudHealthOption[];

interface FieldInputFormControlConfig {
  childFormControlName: string;
  option: McsCloudHealthOption;
}

const MIN_NUMBER = 1;

@Component({
  selector: 'mcs-field-input-list',
  templateUrl: './field-input-list.component.html',
  styleUrls: ['./field-input-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'field-input-list-wrapper'
  }
})
export class FieldInputListComponent extends FormFieldBaseComponent2<McsCloudHealthOption[]>
  implements OnInit {

  public fgInputList: FormGroup<any>;
  public fcChildInput: FormControl<any>;

  public selectedOptions = [];
  public placeholder: string;
  public childInputFcConfig$: Observable<FieldInputFormControlConfig[]>;

  private _optionList: McsOptionType;
  private _inputType: string;
  private _changes: McsCloudHealthOption[] = [];

  private _childInputFcConfigChange: BehaviorSubject<FieldInputFormControlConfig[]>;

  @Input()
    public get optionList(): McsOptionType { return this._optionList; }
    public set optionList(value: McsOptionType) {
      if (this._optionList !== value) {
        this._optionList = value;
      }
    }

  @Input()
    public get inputType(): string { return this._inputType; }
    public set inputType(value: string) { this._inputType = value; }

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService
  ) {
    super(_injector);
    this._childInputFcConfigChange = new BehaviorSubject([]);
    this._registerFormGroup();
  }

  public get minNum(): number {
    return MIN_NUMBER; 
  }

  public ngOnInit() {
    this._registerFormControl();
    this._subscribeToChildLicenseMapChange();
  }

  public isFormValid(): boolean {
    return getSafeProperty(this.fgInputList, (obj) => obj.valid, false);
  }

  public onInputChange(event, option: McsCloudHealthOption): void {
    if (!isNullOrEmpty(event)) {
      this._changes.push({
        text: event?.target?.value,
        subText: option?.subText,
        alertType: option?.alertType,
        config: option?.config,
        actionLabel: option?.actionLabel
      });

      let uniqueValues = [...new Map(this._changes.map(item => [item['config']?.name, item])).values()]
      // remove empty values 
      this._changes = uniqueValues.filter((data) => !isNullOrEmpty(data?.text));
      let value = this.isFormValid() ? this._changes : [];
      this.writeValue(value);
    }
  }

  public getFormControl(formControlName: string): AbstractControl {
    return this.fgInputList.get(formControlName);
  }

  private _subscribeToChildLicenseMapChange(): void {
    this.childInputFcConfig$ = this._childInputFcConfigChange.asObservable().pipe(
      shareReplay(1),
      distinctUntilChanged()
    );
  }

  private _registerFormGroup(): void {
    this.fgInputList = this._formBuilder.group({});
  }

  private _registerFormControl(): void {
    let childInputFcConfig = [];
    
    if (this.optionList?.length === 0) { return; }
    this.optionList.forEach((option, index)  => {
      let childFormControl;
      switch(this._inputType) {
        case 'number':
          childFormControl = new FormControl<any>('', [
            CoreValidators.numeric,
            CoreValidators.min(this.minNum)
          ]);
          this.placeholder = this._translate.instant('orderMsRequestChange.detailsStep.numberPlaceHolder');
          break;
        case 'email':
          childFormControl = new FormControl<any>('', CoreValidators.email);
          this.placeholder = this._translate.instant('orderMsRequestChange.detailsStep.emailPlaceHolder');
          break;
        default:
          break;
      }
      let childFormControlName = `fcChildInput${index}`;
      childInputFcConfig.push({ childFormControlName, option, referenceId: Guid.newGuid().toString() });
      this.fgInputList.addControl(childFormControlName, childFormControl);
    });

    this._childInputFcConfigChange.next(childInputFcConfig);
  }
}