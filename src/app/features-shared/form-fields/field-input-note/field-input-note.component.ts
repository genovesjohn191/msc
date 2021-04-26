import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatTextareaAutosize } from '@angular/material/input';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputNote } from './field-input-note';

@Component({
  selector: 'mcs-field-input-note',
  templateUrl: './field-input-note.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input-note'
  }
})
export class FieldInputNoteComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInputNote, OnInit, OnDestroy {

  @ViewChild('autoSize', { read: MatTextareaAutosize })
  private _autoSize: MatTextareaAutosize;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnInit(): void {
    this._updateTextAreaSize();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _updateTextAreaSize(): void {
    setTimeout(() => {
      this._autoSize.matTextareaAutosize = true;
      this._autoSize.resizeToFitContent(true);
    });
  }
}