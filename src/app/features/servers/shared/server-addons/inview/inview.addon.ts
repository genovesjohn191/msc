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
import { McsServerCreateAddOnInview } from '@app/models';
import {
  McsDataChange,
  unsubscribeSafely
} from '@app/utilities';
import { CoreValidators } from '@app/core';

@Component({
  selector: 'mcs-inview-addon',
  templateUrl: './inview.addon.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'inview-wrapper'
  }
})

export class InviewAddOnComponent implements
  OnInit, OnDestroy, McsDataChange<McsServerCreateAddOnInview> {

  public inviewOptions$: Observable<string[]>;
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
    let inviewDetails = new McsServerCreateAddOnInview();
    inviewDetails.inviewLevel = this.fcInview.value;
    this.dataChange.emit(inviewDetails);
  }

  /**
   * Subscribe to inview options
   */
  private _subscribeToInviewOptions(): void {
    // TODO: This should be obtained on api
    this.inviewOptions$ = of([
      'Premium',
      'Standard'
    ]);
  }

  /**
   * Registers all form group on the anti malware
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
