import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
} from '../../dynamic-form-field-config.interface';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import {
  ManagementDomain,
  managementDomainText,
  McsOption
} from '@app/models';
import {
  DynamicSelectChipsFieldComponentBase,
  DynamicSelectChipsValue
} from '../dynamic-select-chips-field-component.base';
import { DynamicSelectChipsManagementDomainField } from './select-chips-management-domain';

@Component({
  selector: 'mcs-dff-select-chips-management-domain-field',
  templateUrl: '../shared-template/select-chips.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsManagementDomainComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsManagementDomainComponent extends DynamicSelectChipsFieldComponentBase<McsOption> {
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsManagementDomainField;
  private _searchKeyword: string;

  constructor(
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  // Override function to allow field to map with service ID
  public writeValue(value: any): void {
    if (isNullOrEmpty(value)) {
      this.config.value = [];
    } else {
      this.config.value = value;
    }
  }

  public add(event: MatChipInputEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }

    const input = event.input;
    const value = event.value;

    // Add our custom value to the array
    let validCustomInput = this.config.allowCustomInput && !isNullOrEmpty(value?.trim());
    if (validCustomInput) {
      this._tryAddChip({
        value: value.trim(),
        label: value.trim()
      });
    }

    // Clean up and notify
    if (input) { input.value = ''; }
    this.inputCtrl.setValue(null);
    this.valueChange(this.config.value);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }
    let option = event.option.value as FlatOption;
    this.valueInput.nativeElement.blur();
    this._tryAddChip({
      value: option.key,
      label: option.value
    });

    // Clean up and notify
    this.valueInput.nativeElement.value = '';
    this.inputCtrl.setValue(null);
    this.valueChange(this.config.value);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  public search(selectedOption: McsOption | string): Observable<FlatOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.key.indexOf(option.key) === 0));
    }

    this._searchKeyword = selectedOption.toLowerCase();
    return of(this.filter(this.collection));
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let singleValue = value;
    this.dataChange.emit({
      value: singleValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsOption[]> {
    return of([
      createObject(McsOption, {
        text: managementDomainText[ManagementDomain.BackupSydIntellicentreNetAu],
        value: managementDomainText[ManagementDomain.BackupSydIntellicentreNetAu]
      }),
      createObject(McsOption, {
        text: managementDomainText[ManagementDomain.MgtSydIntellicentreNetAu],
        value: managementDomainText[ManagementDomain.MgtSydIntellicentreNetAu]
      })
    ]);
  }

  protected filter(collection: McsOption[]): FlatOption[] {
    let options: FlatOption[] = [];
    collection.forEach((item) => {
      let searchKeywordInArray = item.value.includes(this._searchKeyword);
      if (!searchKeywordInArray) { return; }
      let key = item.text;
      let value = item.value;
      options.push({ type: 'flat', key, value });
    });

    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }
    return options;
  }

  private _tryAddChip(chip: DynamicSelectChipsValue): void {
    let isUnique = this.config.value.findIndex(val => val.value.toLowerCase() === chip.value.toLowerCase()) < 0;
    if (!this.config.allowDuplicates && !isUnique) {
      return;
    }

    let validToReplaceValue = this._isItemLimitReached(this.config.value) && Math.trunc(this.config.maxItems) === 1;
    if (validToReplaceValue) {
      // This allows auto replace of value if allowed max items is 1
      this.config.value = [];
    }

    if (!this._isItemLimitReached(this.config.value)) {
      this.config.value.push(chip);
    }
  }

  private _isItemLimitReached(items: DynamicSelectChipsValue[]): boolean {
    return items.length >= Math.trunc(this.config.maxItems) && this.config.maxItems > 0;
  }
}
