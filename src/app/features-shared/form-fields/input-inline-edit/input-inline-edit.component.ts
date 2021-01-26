import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import {
  forwardRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent } from '../form-field.base';

enum InlineEditMode {
  View = 1,
  Edit = 2
}

@Component({
  selector: 'mcs-input-inline-edit',
  templateUrl: './input-inline-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputInlineEditComponent),
      multi: true
    }
  ],
  host: {
    'class': 'mcs-input-inline-edit'
  }
})
export class InputInlineEditComponent
  extends FormFieldBaseComponent<string>
  implements OnInit, OnDestroy {

  @Input()
  public disabled: boolean;

  @Input()
  public placeholder: string;

  public inlineEditMode$: Observable<InlineEditMode>;

  private _inlineEditModeChange = new BehaviorSubject<InlineEditMode>(InlineEditMode.View);
  private _destroySubject = new Subject<void>();

  public get inlineEditMode(): typeof InlineEditMode {
    return InlineEditMode;
  }

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this._subscribeToInlineEditModeChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public onSetEditMode(): void {
    this._inlineEditModeChange.next(InlineEditMode.Edit);
  }

  public onSetViewMode(): void {
    this._inlineEditModeChange.next(InlineEditMode.View);
  }

  private _subscribeToInlineEditModeChange(): void {
    this.inlineEditMode$ = this._inlineEditModeChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged()
    );
  }
}