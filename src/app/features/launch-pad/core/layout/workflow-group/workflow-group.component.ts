import { TranslateService } from '@ngx-translate/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  forkJoin,
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';

import {
  McsApiErrorContext,
  McsObjectCrispElement,
  McsObjectCrispElementService,
  McsObjectCrispElementServiceAttribute,
  ProductType,
  WorkflowType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid,
  CommonDefinition
} from '@app/utilities';

import { LaunchPadWorkflow } from '../../workflows/workflow';
import { WorkflowGroupDirective } from '../../workflows/workflow-group.directive';
import {
  WorkflowGroup,
  WorkflowGroupConfig,
  WorkflowGroupSaveState
} from '../../workflows/workflow-group.interface';
import { workflowGroupMap } from '../../workflows/workflow-group.map';
import { WorkflowGroupId } from '../../workflows/workflow-groups/workflow-group-type.enum';
import {
  Workflow,
  WorkflowData
} from '../../workflows/workflow.interface';
import { WorkflowService } from '../../workflows/workflow.service';
import { LaunchPadServiceIdSwitchDialogComponent } from '../service-id-switch-dialog/service-id-switch-dialog.component';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadForm } from '../../workflows/forms/form.interface';

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  styleUrls: ['./workflow-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowGroupComponent implements OnInit, OnDestroy {
  @ViewChild(WorkflowGroupDirective, {static: true})
  public workflowGroup: WorkflowGroupDirective;

  @Input()
  public set context(value: WorkflowGroupSaveState) {
    if (isNullOrEmpty(value)) { return; }
    this._context = value;

    this._initWorkflowGroup();
  }

  public get context(): WorkflowGroupSaveState {
    return this._context;
  }

  @Input()
  protected loadWorkflowNotifier: Subject<Workflow[]>;

  public get valid(): boolean {
    let validForm = true;
    let validServiceId: boolean = !isNullOrEmpty(this.context.serviceId);

    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included && !ref.instance.valid) {
        validForm = false;
      }
    });

    return validForm && validServiceId;
  }

  public get payload(): Workflow[] {
    let payloadItems: Workflow[] = [];
    this.workflowComponentRef.forEach(ref => {
      let payload = ref.instance.getRawValue();
      if (!isNullOrEmpty(payload)) {
        payloadItems.push(payload);
      }
    });

    return payloadItems;
  }

  public get hasContextualHelp(): boolean {
    let hasContextualHelp = false;
    let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);
    if (isNullOrEmpty(workflowGroup)) { return hasContextualHelp; }

    workflowGroup.parent.form.config.forEach((field) => {
      if (!isNullOrEmpty(field.contextualHelp)) {
        hasContextualHelp = true;
      }
    });

    if (hasContextualHelp) { return hasContextualHelp };

    workflowGroup.children?.forEach((child) => {
      child.form.config.forEach((field) => {
        if (!isNullOrEmpty(field.contextualHelp)) {
          hasContextualHelp = true;
        }
      });
    });

    return hasContextualHelp;
  }

  public workflowComponentRef: ComponentRef<LaunchPadWorkflowComponent>[] = [];
  public componentRef: ComponentRef<any>;
  public ongoingServiceIdRetrieval: boolean = false;
  public hasServiceIdRetrievalError: boolean = false;
  private _context: WorkflowGroupSaveState;
  private _dialogSubject = new Subject<void>();
  private _parentServiceRetrieved: EventEmitter<McsObjectCrispElementService[]>;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: WorkflowService,
    private _apiService: McsApiService,
    private _dialog: MatDialog,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar) {

      this._parentServiceRetrieved = new EventEmitter<McsObjectCrispElementService[]>();
      this._listenToParentServiceRetrieval();
    }

  public ngOnInit(): void {
    if (!isNullOrEmpty(this.loadWorkflowNotifier)) {
      this.loadWorkflowNotifier.subscribe((workflows) => this._loadWorkflowGroup(workflows));
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._dialogSubject);
  }

  public reset(): void {
    let parentReferenceId = Guid.newGuid().toString();

    this.workflowComponentRef.forEach(ref => {
      // Set new reference IDs
      if (isNullOrEmpty(ref.instance.parentReferenceId)) {
        ref.instance.referenceId = parentReferenceId;
      } else {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
      }

      ref.instance.reset();
    });
  }

  public switchObject(event: McsObjectCrispElement): void {
    let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);
    let requiresCrispData = !isNullOrEmpty(workflowGroup.parent.form?.mapCrispElementAttributes);

    if (!requiresCrispData) {
      this.context.serviceId = event.serviceId;
      this.context.productId = event.productId.toString();
      this._updateWorkflowInstances(this.context);
      this._changeDetector.markForCheck();
      return;
    }

    const loadSaveStateDialogRef =
      this._dialog.open(LaunchPadServiceIdSwitchDialogComponent, { data: event.serviceId + ' [' + event.productId + ']' });

    loadSaveStateDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result) {
        this.context.serviceId = event.serviceId;
        this.context.productId = event.productId.toString();

        this._initWorkflowGroup();
        this._updateWorkflowInstances(this.context);
        this._changeDetector.markForCheck();
      } else {
        this.context.serviceId = event.serviceId;
        this.context.productId = event.productId.toString();
        this._updateWorkflowInstances(this.context);
        this._changeDetector.markForCheck();
      }
    });
  }

  private _loadWorkflowGroup(workflows: Workflow[]): void {
    if (isNullOrEmpty(workflows)) {
      return;
    }

    // Load and edit each workflow
    let parentReferenceId: string = '';

    this.workflowComponentRef.forEach(ref => {
      // WARNING: Workflow - This will not handle similar types in a group
      let workflowIndex = workflows.findIndex((workflow) => workflow.type === ref.instance.type);

      let includeWorkflow = workflowIndex >= 0;
      if (!includeWorkflow) {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
        ref.instance.close();
        return;
      }

      // Set Service ID for the workflow group
      let isParentWorkflow = !isNullOrEmpty(workflows[workflowIndex].serviceId);
      if (isParentWorkflow) {
        parentReferenceId = workflows[workflowIndex].referenceId;
        this.context.serviceId = workflows[workflowIndex].serviceId;
      }

      // Load values to form
      ref.instance.load(workflows[workflowIndex]);
    });
  }

  private _initWorkflowGroup(): void {
    let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);

    let requiresCrispData = !isNullOrEmpty(workflowGroup.parent.form?.mapCrispElementAttributes);

    if (requiresCrispData) {
      this._crispInitWorkflowGroup(workflowGroup);
    }
    else {
      this._defaultInitWorkflowGroup(workflowGroup);
    }
  }

  private _defaultInitWorkflowGroup(workflowGroup: WorkflowGroup): void {
    let parent: WorkflowData = this._buildWorkflowData({
      id: workflowGroup.parent.id,
      form: workflowGroup.parent.form,
      serviceId: this.context.serviceId,
      productId: this.context.productId
    });
    let children: WorkflowData[] = this._buildWorkflowDataForChildWorkflows(workflowGroup);

    this._context.config = {
      id: this.context.workflowGroupId,
      parent,
      children
    };

    this._renderWorkflowGroup(this.context.config);
    this._changeDetector.markForCheck();
  }

  private _crispInitWorkflowGroup(workflowGroup: WorkflowGroup): void {
    this._apiService.getCrispElement(this.context.productId)
    .pipe(
      catchError((error: McsApiErrorContext) => {
        if (error?.details?.status !== 404) {
          this._snackBar.open(
          this._translateService.instant('snackBar.workflowCrispObjectLoadingFailed'),
          this._translateService.instant('action.ok'),
          {
            duration: CommonDefinition.SNACKBAR_ACTIONABLE_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: CommonDefinition.SNACKBAR_WARN_CLASS
          });
        }

        let parent: WorkflowData = this._buildWorkflowData({
          id: workflowGroup.parent.id,
          form: workflowGroup.parent.form,
          serviceId: this.context.serviceId,
          productId: this.context.productId
        });

        this._context.config = {
          id: this.context.workflowGroupId,
          parent,
          children: this._buildWorkflowDataForChildWorkflows(workflowGroup)
        };

        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP element failed.');
      })
    )
    .subscribe((response) => {
      let parent: WorkflowData = this._buildWorkflowData({
        id: workflowGroup.parent.id,
        form: workflowGroup.parent.form,
        serviceId: this.context.serviceId,
        productId: this.context.productId,
        crispElementServiceAttributes: response.serviceAttributes
      });

      this._context.config = {
        id: this.context.workflowGroupId,
        parent,
        children: this._buildWorkflowDataForChildWorkflows(workflowGroup)
      };

      let childRequiresCrispData =
        !isNullOrEmpty(workflowGroup.children)
        && !isNullOrEmpty(response.associatedServices);

      if (childRequiresCrispData) {
        // Trigger event for retrieving child CRISP data
        this._parentServiceRetrieved.emit(response.associatedServices);
        return;
      }

      this._renderWorkflowGroup(this.context.config);
      this._changeDetector.markForCheck();
    });
  }

  private _listenToParentServiceRetrieval(): void {
    this._parentServiceRetrieved.subscribe((childServices: McsObjectCrispElementService[]) => {

      let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);
      let tasks$ = this._createAssociatedServiceTasks(workflowGroup, childServices);

      if (isNullOrEmpty(tasks$)) {
        this._renderWorkflowGroup(this.context.config, childServices);
        this._changeDetector.markForCheck();
        return;
      }

      // Retrieve data for associated services
      forkJoin(tasks$)
      .pipe(catchError((error) => {
        if (error?.details?.status !== 404) {
          this._snackBar.open(
          this._translateService.instant('snackBar.workflowCrispObjectAssociatesLoadingFailed'),
          this._translateService.instant('action.ok'),
          {
            duration: CommonDefinition.SNACKBAR_ACTIONABLE_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: CommonDefinition.SNACKBAR_WARN_CLASS
          });
        }

        this._renderWorkflowGroup(this.context.config, childServices);
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP associated CRISP elements failed.');
      }))
      .subscribe((results: McsObjectCrispElement[]) => {
        this.context.config.children = this._buildWorkflowDataForChildWorkflows(workflowGroup, results);
        this._renderWorkflowGroup(this.context.config, childServices);
        this._changeDetector.markForCheck();
      });
    });
  }

  private _buildWorkflowData(options: {
    id: WorkflowType;
    form: LaunchPadForm;
    serviceId?: string;
    productId?: string;
    crispElementServiceAttributes?: McsObjectCrispElementServiceAttribute[]
  }): WorkflowData {

    return {
      id : options.id,
      serviceId: options.serviceId,
      productId: options.productId,
      propertyOverrides: this._buildPropertyOverrides(options.form, options.crispElementServiceAttributes),
    };
  }

  private _buildWorkflowDataForChildWorkflows(
    workflowGroup: WorkflowGroup,
    crispElements: McsObjectCrispElement[] = []): WorkflowData[] {

    let children: WorkflowData[] = [];

    workflowGroup.children?.forEach((child) => {
      let crispElement = crispElements?.find((result) => result.productType.toString() === ProductType[child.crispProductType]);
      let data: WorkflowData = this._buildWorkflowData({
        id: child.id,
        form: child.form,
        crispElementServiceAttributes: crispElement?.serviceAttributes
      });

      children.push(data);
    });

    return children;
  }

  private _buildPropertyOverrides(
    form: LaunchPadForm,
    crispAttributes: McsObjectCrispElementServiceAttribute[] = []): { key: string, value: any }[] {

    let propertyOverrides: Array<{ key: string, value: any }> = [];

    // Add context to form field overrides
    let requiresContextMapping = !isNullOrEmpty(form.mapContext);
    if (requiresContextMapping) {
      propertyOverrides = form.mapContext(this.context);
    }

    // Add CRISP attributes to form field overrides
    let hasCrispAttributeOverrides = !isNullOrEmpty(form.mapCrispElementAttributes) && !isNullOrEmpty(crispAttributes);
    if (hasCrispAttributeOverrides) {
      let crispOverrides = form.mapCrispElementAttributes(crispAttributes);
      propertyOverrides = propertyOverrides.concat(crispOverrides);
    }

    return propertyOverrides;
  }

  private _createAssociatedServiceTasks(workflowGroup: WorkflowGroup, childServices: McsObjectCrispElementService[]): any[]  {
    let tasks$ = [];
    // Include associated services that has a child workflow match
    workflowGroup.children.forEach((child) => {
      let requiresCrispData = !isNullOrEmpty(child.crispProductType) && !isNullOrEmpty(child.form?.mapCrispElementAttributes);
      if (!requiresCrispData) { return; }

      let associatedService = childServices.find(
        (childService) => childService.productType.toString() === ProductType[child.crispProductType]);

      if (!isNullOrEmpty(associatedService)) {
        tasks$.push(this._apiService.getCrispElement(associatedService.productId));
      }
    });

    return tasks$;
  }

  private _updateWorkflowInstances(saveState: WorkflowGroupSaveState): void {
    this.workflowComponentRef.forEach(ref => {
      if (!isNullOrEmpty(ref.instance.serviceId)) {
        ref.instance.serviceId = saveState.serviceId;
      }
      if (!isNullOrEmpty(ref.instance.productId)) {
        ref.instance.productId = saveState.productId;
      }
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupConfig, associateServices: McsObjectCrispElementService[] = []): void {
    let workflows: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.context.serviceId = config.parent.serviceId;
    this.context.productId = config.parent.productId;

    // Clear references and instances of existing workflow
    this.workflowComponentRef = [];
    this.workflowGroup.viewContainerRef.clear();

    if (isNullOrEmpty(workflows)) {
      return;
    }

    // Render workflows
    workflows.forEach(workflow => {
      this._renderWorkflow(workflow, associateServices);
    });
  }

  private _renderWorkflow(param: LaunchPadWorkflow, associateServices: McsObjectCrispElementService[] = []): void {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(LaunchPadWorkflowComponent);
    let componentRef = this.workflowGroup.viewContainerRef.createComponent<LaunchPadWorkflowComponent>(componentFactory);

    // Set workflow settings
    componentRef.instance.initialize(param);

    if (!isNullOrEmpty(associateServices)) {
      // Initialize workflow based on associated service info
      let isParentWorkflow = !isNullOrEmpty(param.serviceId);
      let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);

      let crispProductType: string = ProductType[workflowGroup.parent.crispProductType];
      if (!isParentWorkflow) {
        crispProductType = ProductType[workflowGroup.children?.find((child) => child.id === param.type).crispProductType];
      }

      let associatedIndex = associateServices?.findIndex((service) => service.productType.toString() === crispProductType);
      let isAssociated: boolean = associatedIndex >= 0;

      // Open panel if workflow has association to parent
      if (isAssociated) {
        componentRef.instance.open();

        // Update the service ID for child workflow
        if (!isParentWorkflow) {
          componentRef.instance.serviceId = associateServices[associatedIndex].serviceId;
        }
      }

    } else {
      // Loading workflow from draft
      if (param.hasValueOverride) {
        componentRef.instance.open();
      }
    }

    this.workflowComponentRef.push(componentRef);
  }

  private _getWorkflowGroupById(id: WorkflowGroupId): WorkflowGroup {
    let workflowGroupType = workflowGroupMap.get(this.context.workflowGroupId);
    return new workflowGroupType();
  }
}
