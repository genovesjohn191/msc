import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of } from 'rxjs';

import {
  compareStrings,
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOption,
  StorageProfileIops,
  storageProfileIopsText
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectStorageTierField } from './select-storage-tier';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

@Component({
  selector: 'mcs-dff-select-storage-tier-field',
  templateUrl: './select-storage-tier.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectStorageTierComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectStorageTierComponent extends DynamicSelectFieldComponentBase<McsOption> {
  public config: DynamicSelectStorageTierField;
  public preselectedValue: string;

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  public get storageIopsEnum(): any {
    return StorageProfileIops;
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam) {
    switch (params.eventName) {

      case 'company-change':
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsOption[]> {
    return of(this._mapEnumToOption(this.storageIopsEnum, storageProfileIopsText));
  }

  protected filter(collection: McsOption[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      let upperCaseFirstLetter = this._upperCaseFirstLetter(item.value);
      options.push({ type: 'flat', key: upperCaseFirstLetter, value: upperCaseFirstLetter });
    });

    let mappedCrispTier = this.config.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.Ic2StorageTier)?.value as StorageProfileIops;
    let lowerCaseTier = this._upperCaseFirstLetter(mappedCrispTier) as string;

    let matchedCrispValue = options?.find((option) => compareStrings(option.value, lowerCaseTier) === 0);

    if (!isNullOrEmpty(matchedCrispValue)) {
      this.preselectedValue = matchedCrispValue.key;
      this._changeDetectorRef.markForCheck();
      this.config.value = storageProfileIopsText[mappedCrispTier];
      this.valueChange(this.config.value);
    }
    return options;
  }

  private _mapEnumToOption(enumeration: StorageProfileIops, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'string'))
      .map(objValue => createObject(McsOption, { text: enumText[objValue], value: objValue }));
    return options;
  }

  private _upperCaseFirstLetter(value: any): string {
    return value.charAt(0) + value.substring(1).toLowerCase();
  }
}
