import {
  Component,
  forwardRef,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsField } from './select-chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicTextFieldComponentBase } from '../dynamic-text-field-component.base';

@Component({
  selector: 'mcs-dff-select-chips-field',
  templateUrl: './select-chips.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    'select-chips.component.scss'
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
export class DynamicSelectChipsComponent extends DynamicTextFieldComponentBase {
  public config: DynamicSelectChipsField;

  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  inputCtrl = new FormControl();
  filteredOptions: Observable<FlatOption[]>;

  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super();

    this.filteredOptions = this.inputCtrl.valueChanges.pipe(
      startWith(null as void),
      map((option: string | null) => {
        return option ? this._filter(option) : this.config.options.slice();
      }));
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.config.value, event.previousIndex, event.currentIndex);
  }

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

  public remove(fruit: string): void {
    const index = this.config.value.indexOf(fruit);

    if (index >= 0) {
      this.config.value.splice(index, 1);
    }

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

  private _filter(selectedOption: FlatOption | string): FlatOption[] {
    if (typeof selectedOption === 'object') {
      return this.config.options.filter(option => option.key.indexOf(option.key) === 0);
    }

    const filterValue = selectedOption.toLowerCase();

    return this.config.options.filter(option =>
      option.value.toLowerCase().indexOf(filterValue) === 0
      || option.key.toLowerCase().indexOf(filterValue) === 0);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }
}
