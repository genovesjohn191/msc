import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase,
  DynamicInputNetworkDbNetworkNameField,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectNetworkDbUseCaseField
} from '@app/features-shared/dynamic-form';
import {
  JobStatus,
  McsJob,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkUpdate,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  compareJsons,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { McsEvent } from '@app/events';
import { McsNavigationService } from '@app/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mcs-network-db-network-edit',
  templateUrl: './network-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkEditComponent implements AfterViewInit, OnDestroy {
  @ViewChild('form')
  public form: DynamicFormComponent;
  public network: McsNetworkDbNetwork;
  public unchangedPayload: McsNetworkDbNetworkUpdate;

  public processing: boolean = false;
  public hasError: boolean = false;

  public watchedJob: McsJob;
  private _jobEventHandler: Subscription;

  private _destroySubject = new Subject<void>();
  private _targetId: string = '';

  public formConfig: DynamicFormFieldConfigBase[] = [
    new DynamicInputNetworkDbNetworkNameField({
      key: 'name',
      label: 'Network Name',
      placeholder: 'Enter a network name',
      validators: { required: true, maxlength: 255 }
    }),
    new DynamicInputTextField({
      key: 'description',
      label: 'Description',
      placeholder: 'Enter a description',
      validators: { maxlength: 1024 }
    }),
    new DynamicSelectChipsCompanyField({
      key: 'company',
      label: 'Company',
      placeholder: 'Search for name or company ID...',
      validators: { required: true },
      allowCustomInput: true,
      maxItems: 1,
      eventName: 'company-change',
      dependents: ['name']
    }),
    new DynamicInputTextField({
      key: 'serviceId',
      label: 'Service ID',
      placeholder: 'Enter a service ID',
      validators: { maxlength: 30 }
    }),
    new DynamicSelectNetworkDbUseCaseField({
      key: 'useCaseId',
      label: 'Use Case',
      validators: { required: true }
    })
  ];

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _navigationService: McsNavigationService,
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService
    ) {
      this._subscribeToQueryParams();
      this._networkDetailService.getNetworkDetails().pipe(
        map(network => {
          this.network = network;
        })
      ).subscribe();
  }

  public ngAfterViewInit(): void {
    if (!isNullOrEmpty(this.network)) {
      this.setFormValues(this.network);
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._jobEventHandler);
  }

  public get isValidPayload(): boolean {
    return this.form && this.form.valid && this.isDirty;
  }

  private get isDirty(): boolean {
    return compareJsons(this.getPayload(), this.unchangedPayload) === 0 ? false : true;
  }

  private setFormValues(network: McsNetworkDbNetwork): void {
    this.form.setFieldProperties({
      name: {
        value: network.name,
        whitelist: [network.name]
      },
      description: { value: network.description },
      company: { value: [{ value: network.companyId, label: network.companyName }] },
      serviceId: { value: network.serviceId },
      useCaseId: { value: network.useCaseId.toString() }
    });

    this.unchangedPayload = this.getPayload();
  }

  public submit(): void {
    this.hasError = false;
    this.processing = true;

    this._apiService.updateNetworkDbNetwork(this.network.id,this.getPayload())
      .pipe(catchError(() => {
        this.hasError = true;
        this.processing = false;

        this._changeDetector.markForCheck();
        return throwError('Network update endpoint failed.');
      }))
      .subscribe((response: McsJob) => {
        this._watchThisJob(response);
      });
  }

  private _watchThisJob(job: McsJob): void {
    this.watchedJob = job;
    this._jobEventHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobUpdatesReceived.bind(this));
  }

  private _onJobUpdatesReceived(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.watchedJob.id;
    if (!watchedJob)  { return; }
    this.watchedJob = job;

    // Successful
    if (job.status === JobStatus.Completed) {
      this.hasError = false;
      this.processing = false;

      this._changeDetector.markForCheck();
      this.refreshNetworkDetails(job?.clientReferenceObject?.networkId);

      this.navigateToOverview();
    }
    // Failed
    else if (job.status > JobStatus.Completed) {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
    }
  }

  private refreshNetworkDetails(id: string): void {
    this._apiService.getNetworkDbNetwork(id).pipe(
      map((network) => {
        if (isNullOrEmpty(network)) { return; }
        this._networkDetailService.setNetworkDetails(network);
      }
    )).subscribe();
  }

  private navigateToOverview(): void {
    let navigationExtras = {
      queryParams: {
        id: this._targetId
      }
    };

    this._navigationService.navigateTo(
      RouteKey.LaunchPadNetworkDbNetworkDetails,
      [this.network.id.toString()],
      navigationExtras
    );
  }

  public retry(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetector.markForCheck();
  }

  public getNotificationRoute(): any[] {
    return [RouteKey.Notification, this.watchedJob.id];
  }

  public getPayload(): McsNetworkDbNetworkUpdate {
    if (isNullOrEmpty(this.form)) { return new McsNetworkDbNetworkUpdate(); }
    let properties = this.form.getRawValue();

    return createObject(McsNetworkDbNetworkUpdate, {
      clientReferenceObject: {
        networkId: this.network.id
      },
      companyId: isNullOrEmpty(properties.company) ? null : properties.company[0].value,
      name: properties.name,
      description: properties.description,
      serviceId: properties.serviceId,
      useCaseId: Number(properties.useCaseId)
    });
  }

  private _subscribeToQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject),
      map((params) => getSafeProperty(params, (obj) => obj.id)),
      tap(id => {
        this._targetId = id;
      })
    ).subscribe();
  }
}