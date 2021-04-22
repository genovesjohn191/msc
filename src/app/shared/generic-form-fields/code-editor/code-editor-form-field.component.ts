import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { McsUniqueId } from '@app/core';
import { ContentChange } from 'ngx-quill';

export interface CodeEditorFieldContent  {
    content: any;
    html: string | null;
    text: string;
}

@Component({
  selector: 'mcs-code-editor-form-field',
  templateUrl: 'code-editor-form-field.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditorFormFieldComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class CodeEditorFormFieldComponent implements ControlValueAccessor {
  @Output()
  public contentChanged: EventEmitter<string> = new EventEmitter();

  @Input()
  public id: string = McsUniqueId.NewId('code-editor');

  @Input()
  public height: string = '400px';

  @Input()
  public placeholder: string;

  @Input()
  public readOnly: boolean = false;

  @Input()
  public required: boolean = false;

  @Input()
  public get content(): string { return this._content; }
  public set content(value: string) {
    this._content = value;
    this._changeDetectorRef.markForCheck();
  }
  private _content: string;

  public quillConfig = {
    syntax: false,
    toolbar: false
  };

  public constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public onContentChanged(param: ContentChange): void {
    this.contentChanged.emit(param.text);
  }

  writeValue(obj: any): void {
    if (obj !== this.content) {
      this.content = obj;
    }
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
  }

  public propagateChange = (_: any) => {};

  public onTouched = () => {};
}