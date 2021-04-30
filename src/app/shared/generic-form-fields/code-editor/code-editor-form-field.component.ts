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
  public height: string = 'auto';

  public backgroundColor: string = '#23241f';
  public readOnlyBackgroundColor: string = '#2b2b2b';

  public quillConfig = {
    syntax: false,
    toolbar: false
  };

  public onContentChanged(param: ContentChange): void {
    this.value = param.text;
  }
}