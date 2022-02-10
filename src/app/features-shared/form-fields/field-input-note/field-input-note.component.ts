import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
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

  @ViewChild('autoSize', { read: CdkTextareaAutosize })
  private _autoSize: CdkTextareaAutosize;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnInit(): void {
    this._updateTextAreaSizeManually();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _updateTextAreaSizeManually(): void {
    // We need to update the size manually because
    // the full width auto adjust of mat-form-field size
    // could not be calculated when it is set to prior.
    setTimeout(() => {
      this._autoSize.resizeToFitContent(true);
    });
  }
}