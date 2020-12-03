# Dynamic Form Fields - Developer Guide

### 1. Create Dynamic Field Config Model
This will be the interface between the dynamic field and developer when adding this field to a dynamic form. The constructor will be responsible for exposing configuration parameters.
- create new folder for your field under `/dynamic-form-field` and create a class file e.g. `input-text.ts`, `select-vdc.ts`, `input-ip.ts`
- create a class for your config following convention for consistency e.g. `DynamicInputTextField`, `DynamicSelectVdcField`, `DynamicInputIpField`
- extend `DynamicFormFieldConfigBase` or another class that already extends this base class if you require
- `type` --- set the `DynamicFormFieldType` public property. This must be unique accross all dynamic fields
- `template` --- set the `DynamicFormFieldTemplate` public property. Create new or reuse an existing template if component HTML is the same. New template should be added to `/dynamic-form-component.html` switch cases list.
- Create a public `constructor` that accepts a single object that contains all configuration parameters you want to expose (`key` property must always be present and required).

### 2. Create Dynamic Field UI Component
This is only required if you want to implement a totally new component or want to override and existing components UI or internal logic, please look at `input-random` field as reference.
If you only want to modify a config model and reuse all UI component of your base component please look at `input-domain` field for reference.

A standard `text field` component structure
```
@Component({
  selector: 'mcs-dff-input-number-field',
  templateUrl: './input-number.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputNumberComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputNumberComponent extends DynamicTextFieldComponentBase {
  public config: DynamicInputNumberField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }
}
```
A standard `select field` component structure
```
@Component({
  selector: 'mcs-dff-select-network-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectNetworkComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectNetworkComponent extends DynamicSelectFieldComponentBase<McsResourceNetwork> {
  public config: DynamicSelectNetworkField;

  // Filter variables
  private _resource: McsResource;
  private _companyId: string = '';

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'company-change':
        this._companyId = params.value;
        this.retrieveOptions();
        break;

      case 'resource-change':
        this._resource = params.value as McsResource;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsResourceNetwork[]> {
    if (isNullOrEmpty(this._resource)) { return of([]); }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getResourceNetworks(this._resource.id, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsResourceNetwork[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({ type: 'flat', key: item.name, value: item.name });
    });

    return options;
  }
}
```
- Create component HTML or reuse an existing template (only create new template if none of the existing shared templates are available)

A standard `text field` component HTML structure
```
<mat-form-field
  *ngIf="visible"
  appearance="outline"
  [hintLabel]="config.hint">
  <mat-label [attr.for]="id">{{ label }}</mat-label>

  <input #control matInput type="text"
    [id]="id"
    [required]="required"
    [disabled]="disabled"
    [placeholder]="config.placeholder"
    [maxlength]="config.validators?.maxlength"
    [minlength]="config.validators?.minlength"
    [pattern]="config.pattern"
    [(ngModel)]="config.value"
    (input)="valueChange($event)"/>
  <mat-hint align="end" *ngIf="config.validators?.maxlength > 0">{{control.value?.length || 0}}/{{ config.validators?.maxlength }}</mat-hint>

</mat-form-field>
```
A standard `select field` component HTML structure
```
<mat-form-field
  *ngIf="visible"
  appearance="outline"
  [hintLabel]="config.hint"
  [matBadge]="hasError ? '!' : ''"
  matBadgePosition="before"
  matBadgeColor="warn"
  matBadgeSize="small"
  [matTooltip]="hasError ? 'Failed to load options' : ''"
  matTooltipPosition="above">
  <mat-label [attr.for]="id" >{{ isLoading ? 'Loading...' : label }}</mat-label>

  <mat-select
    [id]="id"
    [required]="required"
    [disabled]="disabled"
    [(value)]="config.value"
    (selectionChange)="valueChange($event)">
    <mat-option *ngIf="!required">-- None --</mat-option>
    <mat-option *ngFor="let opt of config.options" [value]="opt.key">
      {{ opt.value }}
    </mat-option>
  </mat-select>

  <mat-spinner *ngIf="isLoading" class="spinner" diameter="20" matSuffix></mat-spinner>

  <button mat-icon-button matSuffix
    (click)="retrieveOptions()"
    *ngIf="hasError"
    matTooltip="Retry"
    matTooltipPosition="above">
    <mat-icon color="primary">refresh</mat-icon>
  </button>

</mat-form-field>
```

- `/dynamic-form-field/index.ts` --- add import entry
- `/dynamic-form-field/dynamic-form-field.module.ts` --- add to module exports list
### 3. Integrate New Field to Dynamic Form
This step is only required if new template or new validation is introduced.
- `/dynamic-form-component.html` --- add new template to switch case
- `/dynamic-form-validation.service.ts` --- add new validation requirements

### 4. Test
- Custom Config Params - only relevant if new logic is introduced along with non-standard config params
- Functionality - only relevant when creating a new dynamic field component UI
- Validation --- only relevant when introducing new validations
- Integration --- when a new created dynamic field component has logic on `onFormDataChange`, `callService`, `filter`
- Error Handling and Recovery --- only relevant when creating a new dynamic field component UI
