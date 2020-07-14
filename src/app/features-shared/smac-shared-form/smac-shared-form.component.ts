import {
  Component,
  ChangeDetectionStrategy,
  Output,
  OnInit,
  EventEmitter,
  OnDestroy,
  ViewChild,
  Input
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Observable,
  Subject,
  zip,
  of
} from 'rxjs';
import {
  takeUntil,
  filter,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { McsOption } from '@app/models';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  getSafeFormValue
} from '@app/utilities';
import {
  CoreValidators,
  IMcsFormGroup
} from '@app/core';
import { McsFormGroupDirective } from '@app/shared';
import { SmacSharedDetails } from './smac-shared-details';


@Component({
  selector: 'mcs-smac-shared-form',
  templateUrl: 'smac-shared-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SmacSharedFormComponent implements IMcsFormGroup, OnInit, OnDestroy {

  public fgSmacSharedForm: FormGroup;
  public fcTestCases: FormControl;
  public fcContact: FormControl;
  public fcCustomerReference: FormControl;
  public fcNotes: FormControl;

  public contactOptions$: Observable<McsOption[]>;

  @Output()
  public dataChange = new EventEmitter<SmacSharedDetails>();

  @Input()
  public testCasePlaceholder: string;

  @Input()
  public phoneNumber: string;

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  private _valueChangesSubject = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _translate: TranslateService
  ) { }

  public ngOnInit(): void {
    this._subscribeToContactOptions();
    this._registerFormGroup();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._valueChangesSubject);
  }

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    if (!this.isValid()) { return; }

    this.dataChange.emit(createObject(SmacSharedDetails, {
      testCases: this.fcTestCases.value || [],
      contactAfterChange: this.fcContact.value,
      referenceNumber: getSafeFormValue(this.fcCustomerReference, (obj) => obj.value),
      notes: getSafeFormValue(this.fcNotes, (obj) => obj.value)
    }));
  }

  /**
   * Registers form group
   */
  private _registerFormGroup(): void {
    this.fcTestCases = new FormControl([], [CoreValidators.rangeArray(0, 20)]);
    this.fcContact = new FormControl(true, [CoreValidators.required]);
    this.fcCustomerReference = new FormControl('', []);
    this.fcNotes = new FormControl('', []);

    this.fgSmacSharedForm = this._formBuilder.group({
      fcTestCases: this.fcTestCases,
      fcContact: this.fcContact,
      fcCustomerReference: this.fcCustomerReference,
      fcNotes: this.fcNotes
    });
  }

  /**
   * Subscribe to the form changes
   */
  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      filter(() => this.isValid()),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  /**
   * Initialize the options for contact control
   */
  private _subscribeToContactOptions(): void {
    this.contactOptions$ = of([
      createObject(McsOption, { text: this._translate.instant('smacShared.form.contact.options.yes'), value: true }),
      createObject(McsOption, { text: this._translate.instant('smacShared.form.contact.options.no'), value: false })
    ]);
  }
}
