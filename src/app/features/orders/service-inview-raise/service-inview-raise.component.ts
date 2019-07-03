import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Injector,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Subject,
  Observable,
  throwError
} from 'rxjs';
import {
  map,
  catchError,
  shareReplay,
  takeUntil
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  CoreDefinition,
  CoreValidators
} from '@app/core';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsServer,
  InviewLevel
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { ServiceInviewRaiseService } from './service-inview-raise.service';
import { OrderDetails } from '@app/features-shared';

// TODO: would be used in the integration to API
// type RaiseInviewLevelProperties = {
//   inviewLevel: string;
// };

// const SERVICE_RAISE_INVIEW_REF_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-order-service-inview-raise',
  templateUrl: 'service-inview-raise.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceInviewRaiseService]
})

export class ServiceInviewRaiseComponent extends McsOrderWizardBase implements OnDestroy {

  public services$: Observable<McsServer[]>;
  public fgServiceInviewDetails: FormGroup;
  public fcService: FormControl;

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns a specifc label based on inview level
   */
  public get inviewLevelLabel(): string {
    return this._inviewLevelLabelMap.get(this._inviewLevel);
  }

  /**
   * Returns true if Inview level is either Premium or Standard
   */
  public get isRaiseInviewButtonShown(): boolean {
    return this._inviewLevel === InviewLevel.Standard || this._inviewLevel === InviewLevel.Premium;
  }

  /**
   * Returns true when the form is valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._inviewLevel === InviewLevel.Standard;
  }

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _inviewLevel: InviewLevel = InviewLevel.None;
  private _destroySubject = new Subject<void>();
  private _inviewLevelLabelMap: Map<InviewLevel, string>;

  constructor(
    _injector: Injector,
    private _serviceInviewRaiseService: ServiceInviewRaiseService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
  ) {
    super(_injector, _serviceInviewRaiseService);
    this._populateInviewLevelLabelMap();
    this._registerFormGroups();
    this._getAllServices();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event listener whenever service is change
   */
  public onChangeService(server: McsServer): void {
    this._inviewLevel = getSafeProperty(server, (obj) => obj.inViewLevel, InviewLevel.None);
  }

  /**
   * Event that emits when the user confirms the changes in details step
   * @param orderDetails Order details to be set
   */
  public onSubmitServiceInviewDetails(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._serviceInviewRaiseService.createOrUpdateOrder({
      contractDurationMonths: orderDetails.contractDurationMonths,
      description: orderDetails.description,
      billingEntityId: orderDetails.billingEntityId,
      billingSiteId: orderDetails.billingSiteId,
      billingCostCentreId: orderDetails.billingCostCentreId
    });
  }

  /**
   * Get all the Services
   */
  private _getAllServices(): void {
    // Managed servers for now, but eventually all Services
    this.services$ = this._apiService.getServers().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection).filter(
        (server) => !server.isSelfManaged && !server.isDedicated && server.serviceChangeAvailable)
      ),
      catchError((error) => {
        return throwError(error);
      }),
      shareReplay(1)
    );
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fgServiceInviewDetails = this._formBuilder.group([]);
    this.fcService = new FormControl('', [CoreValidators.required]);

    this.fgServiceInviewDetails = new FormGroup({
      fcService: this.fcService
    });

    this.fgServiceInviewDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  /**
   * Set ticket type based on selection
   */
  private _populateInviewLevelLabelMap(): void {
    this._inviewLevelLabelMap = new Map();
    this._inviewLevelLabelMap.set(
      InviewLevel.None,
      this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.none')
    );
    this._inviewLevelLabelMap.set(
      InviewLevel.Standard,
      this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.standard')
    );
    this._inviewLevelLabelMap.set(
      InviewLevel.Premium,
      this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.premium')
    );
  }

}
