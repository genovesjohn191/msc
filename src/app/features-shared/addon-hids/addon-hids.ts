import {
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  Component,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import {
  Observable,
  of,
  Subject
} from 'rxjs';
import {
  IMcsDataChange,
  CoreValidators
} from '@app/core';
import { McsServerCreateAddOnHids } from '@app/models';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-addon-hids',
  templateUrl: './addon-hids.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'addon-hids-wrapper'
  }
})

export class AddOnHidsComponent implements
  OnInit, OnDestroy, IMcsDataChange<McsServerCreateAddOnHids> {

  public protectionLevelOptions$: Observable<string[]>;
  public fgHids: FormGroup;
  public fcHids: FormControl;

  @Output()
  public dataChange = new EventEmitter<McsServerCreateAddOnHids>();
  private _destroySubject = new Subject<void>();

  public ngOnInit(): void {
    this._subscribeToHidsProtectionLevelOptions();
    this._registerFormGroup();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    let protectionLevel = getSafeProperty(this.fcHids, (obj) => obj.value);
    if (isNullOrEmpty(protectionLevel)) { return; }

    let hidsDetails = new McsServerCreateAddOnHids();
    hidsDetails.protectionLevel = this.fcHids.value;
    this.dataChange.emit(hidsDetails);
  }

  /**
   * Subscribe to Host Intrusion Detection options
   */
  private _subscribeToHidsProtectionLevelOptions(): void {
    // Hardcoded as this values would not change
    this.protectionLevelOptions$ = of(['Protect', 'Detect']);
  }

  /**
   * Registers all form group on the Host Intrusion Detection
   */
  private _registerFormGroup(): void {
    // Register Form Groups using binding
    this.fcHids = new FormControl('', [CoreValidators.required]);

    this.fgHids = new FormGroup({
      fcHids: this.fcHids
    });
    this.fgHids.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(this.notifyDataChange.bind(this));
  }
}
