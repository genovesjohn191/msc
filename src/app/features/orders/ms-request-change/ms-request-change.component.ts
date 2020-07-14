import {
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Component,
  Injector,
  ViewChild,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Subject,
  zip,
  Observable,
  of,
  Subscription,
  BehaviorSubject
} from 'rxjs';
import {
  filter,
  tap,
  takeUntil,
  map,
  shareReplay,
  distinctUntilChanged
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester,
  McsFormGroupService
} from '@app/core';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  createObject,
  Guid,
  formatStringToPhoneNumber
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import {
  McsOrderWorkflow,
  McsOption,
  McsAccount,
  McsOrderCreate,
  McsOrderItemCreate,
  OrderIdType,
  McsSubscription,
  Category,
  Complexity,
  FormResponse,
  deliveryTypeText,
  categoryText,
  complexityText,
  formResponseText
} from '@app/models';
import { MsRequestChangeService } from './ms-request-change.service';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

const MAX_DESCRIPTION_LENGTH = 850;
const VISIBILE_ROWS = 3;
const MS_REQUEST_SERVICE_CHANGE = Guid.newGuid().toString();
type MsRequestChangeProperties = {
  category: number;
  complexity: string;
  deliveryType: string;
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
  requestDescription: string;
};

@Component({
  selector: 'mcs-ms-request-change',
  templateUrl: 'ms-request-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MsRequestChangeService]
})

export class MsRequestChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgMsServiceChange: FormGroup;
  public fcMsService: FormControl;
  public fcCategory: FormControl;
  public fcComplexity: FormControl;
  public fcContact: FormControl;
  public fcCustomerReference: FormControl;
  public fcRequestDescription: FormControl;

  public categoryOptions$: Observable<McsOption[]>;
  public complexityOptions$: Observable<McsOption[]>;
  public contactOptions$: Observable<McsOption[]>;
  public account$ = new Observable<McsAccount>();
  public subscriptions$ = new Observable<McsOption[]>();

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedServiceHandler: Subscription;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get categoryEnum(): any {
    return Category;
  }

  public get complexityEnum(): any {
    return Complexity;
  }

  public get formResponseEnum(): any {
    return FormResponse;
  }

  public get maxDescriptionLength(): number {
    return MAX_DESCRIPTION_LENGTH;
  }

  public get descriptionVisibleRows(): number {
    return VISIBILE_ROWS;
  }

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _msRequestChangeService: MsRequestChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(
      _injector,
      _msRequestChangeService,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'ms-service-change-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroup();
  }

  public ngOnInit(): void {
    this._subscribeToCategoryOptions();
    this._subscribeToContactOptions();
    this._subscribeToSubscriptions();
    this._subscribeToAccount();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedServiceHandler);
  }

  public onMsServiceRequestOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    if (!this.formIsValid) { return; }
    this._msRequestChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId,
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.MsRequestChange,
            referenceId: MS_REQUEST_SERVICE_CHANGE,
            serviceId: this.fcMsService.value.serviceId,
            deliveryType: deliveryTypeText[orderDetails.deliveryType],
            properties: {
              category: categoryText[this.fcCategory.value],
              complexity: complexityText[Complexity.Simple], // temporarily set complexity value to simple by default
              phoneConfirmationRequired: this._isPhoneConfirmationRequired(this.fcContact.value),
              customerReferenceNumber: this.fcCustomerReference.value,
              requestDescription: this.fcRequestDescription.value,
              deliveryType: deliveryTypeText[orderDetails.deliveryType]
            } as MsRequestChangeProperties
          })
        ]
      }),
      OrderRequester.Billing
    );

    this._msRequestChangeService.submitOrderRequest();
  }

  onNextClick(service: McsSubscription): void {
    if (isNullOrEmpty(service)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public onSubmitOrder(submitDetails: OrderDetails, serviceID: string): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: serviceID
    };
    this.submitOrderWorkflow(workflow);
  }

  public onMsServiceContactChange(selectedContactOption: McsOption) {
    if (isNullOrEmpty(selectedContactOption)) { return; }
    this.fcContact.setValue(selectedContactOption);
  }

  public onChangeService(service: McsSubscription): void {
    if (isNullOrEmpty(service)) { return; }
    this.fcMsService.setValue(service);
  }

  public onChangeCategory(selectedCategory: McsOption): void {
    if (isNullOrEmpty(selectedCategory)) { return; }
    this.fcCategory.setValue(selectedCategory);
  }

  public onChangeComplexity(selectedComplexity: McsOption): void {
    if (isNullOrEmpty(selectedComplexity)) { return; }
    this.fcComplexity.setValue(selectedComplexity);
  }

  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgMsServiceChange);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }
  private _isPhoneConfirmationRequired(isRequired: FormResponse): boolean {
    return (isRequired === FormResponse.Yes);
  }

  private _registerFormGroup(): void {
    this.fcMsService = new FormControl('', [CoreValidators.required]);
    this.fcCategory = new FormControl('', [CoreValidators.required]);
    this.fcContact = new FormControl('', [CoreValidators.required]);
    this.fcCustomerReference = new FormControl('');
    this.fcRequestDescription = new FormControl('', [
      CoreValidators.required,
      (control) => CoreValidators.max(MAX_DESCRIPTION_LENGTH)(control)
    ]);

    this.fgMsServiceChange = this._formBuilder.group({
      fcMsService: this.fcMsService,
      fcCategory: this.fcCategory,
      fcContact: this.fcContact,
      fcCustomerReference: this.fcCustomerReference,
      fcRequestDescription: this.fcRequestDescription,
    });
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid)
    ).subscribe();
  }

  /**
   * Initialize the options for category control
   */
  private _subscribeToCategoryOptions(): void {
    this.categoryOptions$ = of(this._mapEnumToOption(this.categoryEnum, categoryText));
  }

  /**
   * Initialize the options for complexity control
   */
  private _subscribeToComplexityOptions(): void {
    this.complexityOptions$ = of(this._mapEnumToOption(this.complexityEnum, complexityText));
  }


  /**
   * Initialize the options for contact control
   */
  private _subscribeToContactOptions(): void {
    this.contactOptions$ = of(this._mapEnumToOption(this.formResponseEnum, formResponseText));
  }

  private _mapEnumToOption(enumeration: Category, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
        .filter((objValue) => (typeof objValue === 'number'))
        .map(objValue => createObject(McsOption, { text: enumText[objValue] , value: objValue }));
    return options;
  }

  private _subscribeToAccount(): void {
    this.account$ = this._apiService.getAccount().pipe(
      map((response) => {
        response.phoneNumber = formatStringToPhoneNumber(response.phoneNumber);
        return response;
      })
    );
  }

  private _subscribeToSubscriptions(): void {
    this.subscriptions$ =  this._apiService.getSubscriptions().pipe(
      map((subscriptionCollection) => {
        let subscriptions = getSafeProperty(subscriptionCollection, (obj) => obj.collection) || [];
        let subscriptionOptions: McsOption[] = [];
        subscriptions.forEach((subscription) => {
          let textValue = (!isNullOrEmpty(subscription.serviceId)) ? `${subscription.friendlyName} - ${subscription.serviceId}`
                                                                   : `${subscription.friendlyName}`;
          subscriptionOptions.push(createObject(McsOption,
            { text: textValue , value: subscription }));
        });
        return subscriptionOptions;
      }),
      shareReplay(1),
      tap(() => this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent))
    );
  }

  private _registerEvents(): void {
    this._selectedServiceHandler = this._eventDispatcher.addEventListener(
      McsEvent.serviceRequestChangeSelectedEvent, () => this.onChangeService.bind(this));
  }
}

