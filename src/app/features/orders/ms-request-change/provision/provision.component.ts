import {
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
  Observable,
  of,
  Subject,
  throwError,
  zip
} from 'rxjs';
import {
  catchError,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CoreValidators } from '@app/core';
import {
  McsApiCollection,
  McsAzureResource,
  McsOption,
  McsTerraformModule,
  ModuleType,
  moduleTypeText
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { ProvisionDetails } from './provision.details';

const MICROSOFT_RESOURCE_GROUP = 'Microsoft.Resources/resourceGroups';

export enum TerraformModuleType {
  Tsm = 'TSM',
  Trm = 'TRM'
}

export enum StaticResourceGroupOption {
  AddNewResourceGroup = 'New Resource Group',
  NotApplicable = 'Not Applicable'
}

@Component({
  selector: 'mcs-provision',
  templateUrl: './provision.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvisionComponent implements OnInit, OnDestroy {
  // Forms control
  public fgProvision: FormGroup<any>;
  public fcModuleType: FormControl<any>;
  public fcTerraformModule: FormControl<any>;
  public fcResourceGroup: FormControl<any>;
  public fcNewResourceGroupName: FormControl<any>;

  public terraformCategories: McsOption[] = [];
  public terraformModules: McsTerraformModule[] = [];
  public moduleType$: Observable<McsOption[]>;
  public moduleList: McsOption[];
  public moduleType: string;

  private _loadingInProgress: boolean;
  private _isResourceGroupNew: boolean;
  private _azureResources: McsOption[];
  private _moduleHelpText: string;

  private _formGroup: McsFormGroupDirective;
  private _valueChangesSubject = new Subject<void>();
  private _terraformSubject = new Subject<void>();

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  @Input()
  public get azureResources(): McsOption[] { return this._azureResources; }
  public set azureResources(value: McsOption[]) {
    if (isNullOrEmpty(value)) { return; }
    let filteredResources = this._filterResourcesByResourceGroup(value);
    this._azureResources = filteredResources;
    this._changeDetectorRef.markForCheck();
  }

  @Input()
  public resourceLoadingInProgress: boolean;

  @Input()
  public noResourcesFallbackText: string;

  @Output()
  public dataChange = new EventEmitter<ProvisionDetails>();

  public get moduleTypeEnum(): any {
    return ModuleType;
  }

  public get microsoftResourceGroup(): string {
    return MICROSOFT_RESOURCE_GROUP;
  }

  public get newResourceGroupNameText(): string {
    return this._translateService.instant('orderMsRequestChange.detailsStep.newResourceGroupNameLabel');
  }

  public get moduleHelpText(): string {
    return this._moduleHelpText;
  }

  public get resourceGroupNew(): boolean {
    return this._isResourceGroupNew;
  }

  public get loadingInProgress(): boolean {
    return this._loadingInProgress;
  }

  constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this._registerFormGroup();
    this._setToModuleTypeOptions();
  }

  ngOnDestroy(): void {
    unsubscribeSafely(this._valueChangesSubject);
    unsubscribeSafely(this._terraformSubject);
  }

  public setModuleHelpText(module: McsTerraformModule): void {
    this._moduleHelpText = module.description;
  }

  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public onChangeModuleType(moduleType: number) {
    if (isNullOrEmpty(moduleType)) { return; }
    this.moduleType = this._setTerraformModuleType(moduleType);
    this._resetValues();
    if (this.terraformModules.length === 0) {
      this._getTerraformModules();
    } else {
      this.terraformCategories = this._setTerraformCategoryOptions(this.terraformModules);
    }
    this._changeDetectorRef.markForCheck();
  }

  public onChangeResourceGroup(resource: McsAzureResource) {
    let isSelectedResourceAddNewGroup = resource?.azureId === StaticResourceGroupOption.AddNewResourceGroup;
    this._updateResourceGroupNameState(isSelectedResourceAddNewGroup);
    this._isResourceGroupNew = isSelectedResourceAddNewGroup ? true : false;
  }

  private _resetValues(): void {
    this.terraformCategories = [];
    this.moduleList = [];
    this.fcTerraformModule.setValue('');
  }

  private _updateResourceGroupNameState(selectedResourceGroupNew: boolean): void {
    selectedResourceGroupNew ? this.fcNewResourceGroupName.enable() : this.fcNewResourceGroupName.disable();
    this.fgProvision.updateValueAndValidity();
  }

  public onClickCategory(category: McsOption): void {
    // update terraform module list
    this.moduleList = this.terraformModules
      .filter((module) => {
        let sameCategory = module.categoryName === category.text;
        let sameModuleType = module.projectKey === this.moduleType
        return sameCategory && sameModuleType;
      })
      .map(objValue => createObject(McsOption, {
        text: objValue.friendlyName ? objValue.friendlyName : objValue.name,
        value: objValue
      }))
      .sort((a, b) => a.text.localeCompare(b.text)); // sort modules alphabetically
    this._changeDetectorRef.markForCheck();
  }

  private _filterResourcesByResourceGroup(resources: McsOption[]): McsOption[] {
    let resourceGroupOptions: McsOption[] = [];
    // filtered options from API
    let dynamicResourceOptions = resources.filter((resource) => resource.value.type === this.microsoftResourceGroup);
    let staticResourceOptions = this._addStaticOptionInResourceDropdown();
    resourceGroupOptions = staticResourceOptions.concat(dynamicResourceOptions);

    return resourceGroupOptions;
  }

  private _addStaticOptionInResourceDropdown(): McsOption[] {
    let staticOptions: McsOption[] = [];
    staticOptions.push(createObject(McsOption, {
      text: StaticResourceGroupOption.NotApplicable,
      value: { azureId: StaticResourceGroupOption.NotApplicable }
    }));
    staticOptions.push(createObject(McsOption, {
      text: StaticResourceGroupOption.AddNewResourceGroup,
      value: { azureId: StaticResourceGroupOption.AddNewResourceGroup }
    }));
    return staticOptions;
  }

  private _setTerraformModuleType(moduleType: number): string {
    switch(moduleType) {
      case ModuleType.AzureResource:
        return TerraformModuleType.Trm
      case ModuleType.AzureSolution:
        return TerraformModuleType.Tsm
    }
  }

  private _getTerraformModules(): void {
    this._loadingInProgress = true;
    this._apiService.getTerraformModules().pipe(
      shareReplay(1),
      takeUntil(this._terraformSubject),
      catchError((error) => {
        this._loadingInProgress = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    )
    .subscribe((terraformModules: McsApiCollection<McsTerraformModule>) => {
      let modules = getSafeProperty(terraformModules, (obj) => obj.collection) || [];
      this.terraformCategories = this._setTerraformCategoryOptions(modules);
      this.terraformModules = modules;
      this._loadingInProgress = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  private _setTerraformCategoryOptions(modules: McsTerraformModule[]): McsOption[] {
    let moduleCategories = modules
      .filter((module) => module.projectKey === this.moduleType) // filter by selected module type
      .map((module) => module.categoryName);
    let options = moduleCategories
      .filter((item, pos) => moduleCategories.indexOf(item) === pos) // remove duplicate categories
      .sort() // sort modules alphabetically
      .map(objValue => createObject(McsOption, { text: objValue, value: objValue }));
    return options;
  }

  private _setToModuleTypeOptions(): void {
    this.moduleType$ = of(this._mapEnumToOption(this.moduleTypeEnum, moduleTypeText));
  }

  private _mapEnumToOption(enumeration: ModuleType, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => createObject(McsOption, { text: enumText[objValue], value: objValue }));
    return options;
  }

  private _registerFormGroup(): void {
    this.fcModuleType = new FormControl<any>(null, [CoreValidators.required]);
    this.fcTerraformModule = new FormControl<any>('', []);
    this.fcResourceGroup = new FormControl<any>('', [CoreValidators.required]);
    this.fcNewResourceGroupName = new FormControl<any>('', [CoreValidators.required]);

    this.fgProvision = this._formBuilder.group({
      fcModuleType: this.fcModuleType,
      fcTerraformModule: this.fcTerraformModule,
      fcResourceGroup: this.fcResourceGroup,
      fcNewResourceGroupName: this.fcNewResourceGroupName
    });
  }

  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  private notifyDataChange(): void {
    if (!this.isValid()) { return; }

    this.dataChange.emit(createObject(ProvisionDetails, {
      moduleId: getSafeProperty(this.fcTerraformModule, (obj) => obj.value?.id),
      moduleName: getSafeProperty(this.fcTerraformModule, (obj) => obj.value?.name),
      resourceGroup: this._setResourceGroupPayloadValue()
    }));
  }

  private _setResourceGroupPayloadValue(): string {
    let selectedResourceGroup = getSafeProperty(this.fcResourceGroup, (obj) => obj.value?.azureId);
    let newResourceGroupName = getSafeProperty(this.fcNewResourceGroupName, (obj) => obj.value);
    if (selectedResourceGroup === StaticResourceGroupOption.AddNewResourceGroup) {
      return `${this.newResourceGroupNameText}: ${newResourceGroupName}`;
    }
    return selectedResourceGroup;
  }
}