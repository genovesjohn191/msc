import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsField } from './select-chips';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicSelectChipsFieldComponentBase } from '../dynamic-select-chips-field-component.base';

@Component({
  selector: 'mcs-dff-select-chips-field',
  templateUrl: '../shared-template/select-chips.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsComponent extends DynamicSelectChipsFieldComponentBase<string> {
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsField;

  public add(event: MatChipInputEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }

    const input = event.input;
    const value = event.value;

    // Add our custom value to the array
    if (!isNullOrEmpty(value.trim()) && this.config.allowCustomInput) {
      let isUnique = this.config.value.findIndex(val => val.toLowerCase() === value.trim().toLowerCase()) < 0;
      if (this.config.allowDuplicates || isUnique) {
        this.config.value.push(value.trim());
      }
    }

    // Reset the input value
    if (input) { input.value = ''; }

    this.inputCtrl.setValue(null);

    this.valueChange(this.config.value);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }

    let isUnique = this.config.value.findIndex(val => val.toLowerCase() === event.option.viewValue.toLowerCase()) < 0;
    if (this.config.allowDuplicates || isUnique) {
      this.config.value.push(event.option.viewValue);
    }

    this.valueInput.nativeElement.value = '';
    this.inputCtrl.setValue(null);

    this.valueChange(this.config.value);
  }

  public search(selectedOption: string): FlatOption[] {
    if (typeof selectedOption === 'object') {
      return this.config.options.filter(option => option.key.indexOf(option.key) === 0);
    }

    const filterValue = selectedOption.toLowerCase();

    return this.config.options.filter(option =>
      option.value.toLowerCase().indexOf(filterValue) >= 0
      || option.key.toLowerCase().indexOf(filterValue) >= 0);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<string[]> {
    throw new Error('Method not implemented.');
  }

  protected filter(collection: string[]): FlatOption[] {
    throw new Error('Method not implemented.');
  }
}
