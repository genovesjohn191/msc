import {
  Component,
  ChangeDetectionStrategy,
  Output,
  OnInit,
  EventEmitter,
  OnDestroy,
  ViewChild,
  Input,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  ValidatorFn
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
  tap,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { McsOption, McsPermission } from '@app/models';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  formatStringToPhoneNumber,
  formatStringToText
} from '@app/utilities';
import {
  CoreValidators,
  IMcsFormGroup,
  McsAccessControlService
} from '@app/core';
import { McsFormGroupDirective } from '@app/shared';
import { SmacSharedDetails } from './smac-shared-details';
import { SmacSharedFormConfig } from './smac-shared-form-config';
import { McsApiService } from '@app/services';

const NOTES_MAXLENGTH = 850;

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
  public isPhoneNumberLoaded: boolean;

  public contactOptions$: Observable<McsOption[]>;

  @Output()
  public dataChange = new EventEmitter<SmacSharedDetails>();

  @Input()
  public phoneNumber: string;

  @Input()
  public set config(value: SmacSharedFormConfig) {
    if (isNullOrEmpty(value)) { return; }
    this._config = value;
    this._config.validatorsMap.forEach((validators: ValidatorFn[], key: string) => {
      if (getSafeProperty(this.fgSmacSharedForm, (obj) => obj.controls[key])) {
        this.fgSmacSharedForm.controls[key].setValidators(validators);
        this.fgSmacSharedForm.controls[key].updateValueAndValidity();
      }
    });
  }
  public get config(): SmacSharedFormConfig { return this._config; }
  private _config: SmacSharedFormConfig;
  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  private _valueChangesSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _changeDetectionRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
  ) {
    this._registerFormGroup();

    if (isNullOrEmpty(this._config)) {
      this._config = new SmacSharedFormConfig(_injector);
    }
  }

  public ngOnInit(): void {
    this._subscribeToContactOptions();
    this._getContactNumber();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get notesMaxLength(): number {
    return NOTES_MAXLENGTH;
  }

  public get loadingText(): string {
    return this._translate.instant('smacShared.loading.text');
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
      testCases: getSafeProperty(this.fcTestCases, (obj) => obj.value),
      notes: getSafeProperty(this.fcNotes, (obj) => formatStringToText(obj.value)),
      contactAfterChange: getSafeProperty(this.fcContact, (obj) => obj.value),
      referenceNumber: getSafeProperty(this.fcCustomerReference, (obj) => obj.value)
    }));
  }

  /**
   * Registers form group
   */
  private _registerFormGroup(): void {
    this.fcTestCases = new FormControl([], [CoreValidators.rangeArray(0, 20)]);
    this.fcNotes = new FormControl('', []);
    this.fcContact = new FormControl(this._translate.instant('smacShared.form.contact.options.yes'), [CoreValidators.required]);
    this.fcCustomerReference = new FormControl('', []);

    this.fgSmacSharedForm = this._formBuilder.group({
      fcTestCases: this.fcTestCases,
      fcNotes: this.fcNotes,
      fcContact: this.fcContact,
      fcCustomerReference: this.fcCustomerReference
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

  private _getContactNumber(): void {
    this.isPhoneNumberLoaded = false;
    if(isNullOrEmpty(this._config.contactConfig.phoneNumber)){
      let hasViewAllAccess = this._accessControlService.hasPermission([McsPermission.CompanyView]);
      if(hasViewAllAccess){
        this.isPhoneNumberLoaded = true;
        return;
      }
      else {
        this._apiService.getAccount().subscribe(
          (account) => {
            this._config.contactConfig.phoneNumber = formatStringToPhoneNumber(account.phoneNumber);
            this.isPhoneNumberLoaded = true;
          this._changeDetectionRef.detectChanges();
        });
      }
    }
  }
}
