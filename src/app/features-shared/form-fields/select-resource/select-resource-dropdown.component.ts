import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  ActivatedRoute,
  Params
} from '@angular/router';

import { Observable, Subject } from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  IMcsDataChange,
  IMcsFormGroup,
  McsAccessControlService
} from '@app/core';
import {
  McsPermission,
  McsResource,
  ServiceType,
  McsResourceQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  compareStrings,
  convertUrlParamsKeyToLowerCase,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-select-resource-dropdown',
  templateUrl: './select-resource-dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'select-resource-drowpdown'
  }
})
export class SelectResourceDropdownComponent implements OnInit, AfterViewInit, OnDestroy, IMcsFormGroup, IMcsDataChange<McsResource> {
  @Output()
  public dataChange = new EventEmitter<McsResource>();

  @Input()
  public set value(val: McsResource) {
    if (isNullOrEmpty(val)) { return; }
    let resource = this._resources.find(r => r.id === val.id);
    this.fcResource.setValue(resource);
    this._value = val;
  }

  @Input()
  public platform: string = undefined;

  public get value(): McsResource {
    return this._value;
  }

  private _value: McsResource;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  // Forms control
  public fg: FormGroup<any>;
  public fcResource: FormControl<McsResource>;

  public resources$: Observable<McsResource[]>;
  public resource$: Observable<McsResource>;
  public selectedServiceId$: Observable<string>;

  public get resources(): McsResource[] { return this._resources; }
  private _resources: McsResource[];
  private _selectedResource: McsResource;
  private _destroySubject = new Subject<void>();
  private _destroyActivateRouteSubject = new Subject<void>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService
  ) { }

  public ngOnInit(): void {
    this._intializeFormGroup();
    this._subscribeToAllResources();
    this._subscribesToQueryParams();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToFormTouchedState();
    });
  }

  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this.fg, (obj) => obj.valid);
  }

  /**
   * Returns true when server is disabled
   * @param resource Resource to be checked
   */
  public isServerDisabled(resource: McsResource): boolean {
    let isSelfManaged = getSafeProperty(resource, (obj) => obj.isSelfManaged);
    let isServiceChangeAvailable = getSafeProperty(resource, (obj) => obj.serviceChangeAvailable);
    return !isSelfManaged && !isServiceChangeAvailable;
  }

  private _subscribeToAllResources(): void {
    this.resources$ = this.getResourcesByAccess().pipe(
      map((resources) => {
        return resources;
      })
    );
    this._changeDetectorRef.markForCheck();
  }

  public getResourcesByAccess(): Observable<McsResource[]> {
    let queryParam = new McsResourceQueryParam();
    queryParam.platform = this.platform;

    return this._apiService.getResources(null, queryParam).pipe(
      map((response) => {
        let managedResourceIsOn = this._accessControlService.hasPermission([McsPermission.OrderEdit]);

        return response && response.collection.filter(
          (resource) => resource.serviceType === ServiceType.SelfManaged ||
            (managedResourceIsOn && resource.serviceType === ServiceType.Managed)
        );
      })
    );
  }

  public onValueChange(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }

    this._apiService.getResource(resource.id).pipe(
      tap((response) => {
        this._selectedResource = response;
        this.notifyDataChange();
      }),
      shareReplay(1)
    ).subscribe();
  }

  public getResourceDisplayedText(resource: McsResource): string {
    let prefix = this._translate.instant('serverCreate.vdcDropdownList.prefix', {
      service_type: resource.serviceTypeLabel,
      zone: resource.availabilityZone
    });

    return `${prefix} ${resource.name}`;
  }

  public notifyDataChange(){
    this.dataChange.emit(this._selectedResource);
    this._changeDetectorRef.markForCheck();
  }

  private _intializeFormGroup(): void {
    this.fcResource = new FormControl<McsResource>(null, []);

    this.fg = this._formBuilder.group([
      this.fcResource
    ]);
  }

  private _subscribeToFormTouchedState(): void {
    this._formGroup.touchedStateChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  private _subscribesToQueryParams(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroyActivateRouteSubject),
      map((params) => {
        let lowercaseUrlParams: Params = convertUrlParamsKeyToLowerCase(params);
        return lowercaseUrlParams?.serviceid;
      }),
      tap((urlParamServiceId: string) => {
        if (isNullOrEmpty(urlParamServiceId)) { return; }
        this.resources$.subscribe((resources: McsResource[]) => {
          let resourceList = resources;
          let serviceFound = resourceList.find((server) =>
            compareStrings(server?.serviceId, urlParamServiceId) === 0);
          this.fcResource.setValue(serviceFound);
        });
      }),
    );
  }
}