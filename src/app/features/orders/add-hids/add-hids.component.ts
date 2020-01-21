import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl
} from '@angular/forms';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  McsOrderWizardBase,
  McsFormGroupService,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  McsServer,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOption,
  HidsProtectionLevel,
  hidsProtectionLevelText
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject
} from '@app/utilities';
import { OrderDetails } from '@app/features-shared';
import { AddHidsService } from './add-hids.service';

@Component({
  selector: 'mcs-add-hids',
  templateUrl: 'add-hids.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddHidsService]
})

export class AddHidsComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public resources$: Observable<Map<string, McsServer[]>>;

  public fgAddHidsDetails: FormGroup;
  public fcServer: FormControl;
  public fcProtectionLevel: FormControl;
  public protectionLevelOptions: McsOption[] = [];

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _addHidsService: AddHidsService
  ) {
    super(_injector, _addHidsService);
    this._registerFormGroups();
  }

  public ngOnInit() {
    this._initializeProtectionLevelOptions();
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public onSubmitHidsDetails(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public onSubmitOrder(submitDetails: OrderDetails, _servers: McsServer[]): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    // TODO: add the servers, integrate with API when ready
    this.submitOrderWorkflow(workflow);
  }

  public onAddHidsConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._addHidsService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._addHidsService.submitOrderRequest();
  }

  private _subscribeToManagedCloudServers(): void {

    let resourceMap: Map<string, McsServer[]> = new Map();
    this.resources$ = this._apiService.getServers().pipe(
      map((servers) => {
        servers.collection.filter((server) => server.canProvision).forEach((server) => {
          let resourceIsExisting = resourceMap.has(server.platform.resourceName);
          if (resourceIsExisting) {
            resourceMap.get(server.platform.resourceName).push(server);
            return;
          }
          resourceMap.set(server.platform.resourceName, [server]);
        });
        return resourceMap;
      })
    );
    // TODO: Get the server hids provisioned and flag all provisioned to the /servers result
  }

  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgAddHidsDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  private _initializeProtectionLevelOptions(): void {
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Protect, hidsProtectionLevelText[HidsProtectionLevel.Protect]));
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Detect, hidsProtectionLevelText[HidsProtectionLevel.Detect]));
  }

  private _registerFormGroups() {
    this.fgAddHidsDetails = this._formBuilder.group([]);
    this.fcServer = new FormControl('', [CoreValidators.required]);
    this.fcProtectionLevel = new FormControl(HidsProtectionLevel.Detect, [CoreValidators.required]);

    this.fgAddHidsDetails = new FormGroup({
      fcServer: this.fcServer,
      fcProtectionLevel: this.fcProtectionLevel,
    });

    this.fgAddHidsDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }
}
