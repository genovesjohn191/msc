import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  of,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsServerCreateAddOnInview,
  McsOption,
  inviewLevelText,
  InviewLevel
} from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty,
  createObject,
  getSafeFormValue
} from '@app/utilities';
import {
  CoreValidators,
  IMcsDataChange
} from '@app/core';

@Component({
  selector: 'mcs-addon-inview',
  templateUrl: './addon-inview.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'addon-inview-wrapper'
  }
})

export class AddOnInviewComponent implements
  OnInit, OnDestroy, IMcsDataChange<McsServerCreateAddOnInview> {

  public inviewLevelOptions$: Observable<McsOption[]>;
  public fgInview: FormGroup;
  public fcInview: FormControl;

  @Output()
  public dataChange = new EventEmitter<McsServerCreateAddOnInview>();
  private _destroySubject = new Subject<void>();

  public ngOnInit(): void {
    this._subscribeToInviewOptions();
    this._registerFormGroup();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    let inview = getSafeFormValue(this.fcInview, (obj) => obj.value);
    if (isNullOrEmpty(inview)) { return; }

    this.dataChange.emit(createObject(McsServerCreateAddOnInview, {
      inviewLevel: inview
    }));
  }

  /**
   * Initialize all the options for inview
   */
  private _subscribeToInviewOptions(): void {
    this.inviewLevelOptions$ = of([
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Standard], value: InviewLevel.Standard }),
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Premium], value: InviewLevel.Premium })
    ]);
  }

  /**
   * Registers all form group on the inview
   */
  private _registerFormGroup(): void {
    // Register Form Groups using binding
    this.fcInview = new FormControl('', [CoreValidators.required]);

    this.fgInview = new FormGroup({
      fcInview: this.fcInview
    });
    this.fgInview.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(this.notifyDataChange.bind(this));
  }
}
