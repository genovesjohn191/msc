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
  IMcsDataChange,
  IMcsFormGroup,
  McsAccessControlService
} from '@app/core';
import {
  McsPermission,
  McsResource,
  ServiceType
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil, tap } from 'rxjs/operators';

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
    this.fcResource.setValue(val);
    this._value = val;
  }

  public get value(): McsResource {
    return this._value;
  }

  private _value: McsResource;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  // Forms control
  public fg: FormGroup;
  public fcResource: FormControl;

  public resources$: Observable<McsResource[]>;
  public resource$: Observable<McsResource>;

  public get resources(): McsResource[] { return this._resources; }
  private _resources: McsResource[];
  private _selectedResource: McsResource;
  private _destroySubject = new Subject<void>();

  constructor(
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService
  ) { }

  public ngOnInit(): void {
    this._intializeFormGroup();
    this._subscribeToAllResources();
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

  private _subscribeToAllResources(): void {
    this.resources$ = this.getResourcesByAccess().pipe(
      map((resources) => resources.filter((resource) => !resource.isDedicated))
    );
    this._changeDetectorRef.markForCheck();
  }

  public getResourcesByAccess(): Observable<McsResource[]> {
    return this._apiService.getResources().pipe(
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
    this.fcResource = new FormControl('', []);

    this.fg = this._formBuilder.group([
      this.fcResource
    ]);
  }

  private _subscribeToFormTouchedState(): void {
    this._formGroup.touchedStateChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}