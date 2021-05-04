import {
  Component,
  forwardRef,
  Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { McsUniqueId } from '@app/core';
import { ContentChange } from 'ngx-quill';
import { GenericFormFieldComponentBase } from '../generic-form-field.base';

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
export class CodeEditorFormFieldComponent extends GenericFormFieldComponentBase {
  @Input()
  public id: string = McsUniqueId.NewId('code-editor');

  @Input()
  public height: number = 0;

  public get formattedHeight(): string {
    return this.height <= 0 ? 'auto' : `${this.height}px`;
  };

  public backgroundColor: string = '#23241f';
  public foreColor: string = '#fff';

  public quillConfig = {
    syntax: false,
    toolbar: false
  };

  public onContentChanged(param: ContentChange): void {
    this.value = param.text;
  }
}