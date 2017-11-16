import {
  Component,
  AfterViewInit,
  AfterContentInit,
  AfterContentChecked,
  ContentChild,
  ContentChildren,
  QueryList,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { startWith } from 'rxjs/operator/startWith';
import { McsFormFieldControlBase } from '../../core';
import { isNullOrEmpty } from '../../utilities';
import {
  HintComponent,
  ErrorComponent,
  PrefixComponent,
  SuffixComponent
} from './shared';

@Component({
  selector: 'mcs-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('transitionMessages', [
      state('enter', style({ opacity: 1, transform: 'translateY(0%)' })),
      transition('void => enter', [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
      ]),
    ]),
  ],
  host: {
    'class': 'form-field-wrapper',
    '[class.mcs-input-invalid]': 'isValid',
    '[class.mcs-form-field-invalid]': 'isValid',
    '[class.mcs-focused]': 'isFocus',
    '[class.ng-untouched]': 'getControlState("untouched")',
    '[class.ng-touched]': 'getControlState("touched")',
    '[class.ng-pristine]': 'getControlState("pristine")',
    '[class.ng-dirty]': 'getControlState("dirty")',
    '[class.ng-valid]': 'getControlState("valid")',
    '[class.ng-invalid]': 'getControlState("invalid")',
    '[class.ng-pending]': 'getControlState("pending")'
  }
})

export class FormFieldComponent implements AfterViewInit, AfterContentInit, AfterContentChecked {

  public subscriptAnimationState: string = '';

  @ContentChild(McsFormFieldControlBase)
  private _controlChild: McsFormFieldControlBase<any>;

  @ContentChildren(HintComponent)
  private _hintChildren: QueryList<HintComponent>;

  @ContentChildren(ErrorComponent)
  private _errorChildren: QueryList<ErrorComponent>;

  @ContentChildren(PrefixComponent)
  private _prefixChildren: QueryList<PrefixComponent>;

  @ContentChildren(SuffixComponent)
  private _suffixChildren: QueryList<SuffixComponent>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterViewInit(): void {
    // Avoid animations on load.
    this.subscriptAnimationState = 'enter';
    this._changeDetectorRef.detectChanges();
  }

  public ngAfterContentInit(): void {
    this._validateControlChild();
    // Subscribe to any state changes of the control
    startWith.call(this._controlChild.stateChanges, null).subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });

    // Subscribe to form control to update the view whenever there are changes
    let ngControl = this._controlChild.ngControl;
    if (ngControl && ngControl.valueChanges) {
      ngControl.valueChanges.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
    }

    // Subscribe to any changes of the hint
    startWith.call(this._hintChildren.changes, null).subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });

    // Subscribe to any changes of the error
    startWith.call(this._errorChildren.changes, null).subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngAfterContentChecked(): void {
    this._validateControlChild();
  }

  public get isFocus(): boolean {
    return this._controlChild && this._controlChild.focused;
  }

  public get isValid(): boolean {
    return this._controlChild && this._controlChild.errorState;
  }

  public get isRequired(): boolean {
    return this._controlChild && this._controlChild.required;
  }

  public get hasPrefix(): boolean {
    return this._prefixChildren && this._prefixChildren.length > 0;
  }

  public get hasSuffix(): boolean {
    return this._suffixChildren && this._suffixChildren.length > 0;
  }

  public getDisplayedMessages(): 'error' | 'hint' {
    return (this._errorChildren && this._errorChildren.length > 0 &&
      this._controlChild.errorState) ? 'error' : 'hint';
  }

  public onControlFocus(): void {
    if (isNullOrEmpty(this._controlChild)) { return; }
    this._controlChild.focus();
  }

  public getControlState(prop: string): boolean {
    let ngControl = this._controlChild ? this._controlChild.ngControl : null;
    return ngControl && (ngControl as any)[prop];
  }

  private _validateControlChild(): void {
    if (isNullOrEmpty(this._controlChild)) {
      throw new Error('Control form field is missing');
    }
  }
}
