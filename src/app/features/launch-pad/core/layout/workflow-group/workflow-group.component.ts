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
  McsApiErrorContext,
  McsObjectCrispElement,
  McsObjectCrispElementService,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid
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

    this._loadParentWorkflow();
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
      if (!isNullOrEmpty(field.hint)) {
        hasContextualHelp = true;
      }
    });

    if (hasContextualHelp) { return hasContextualHelp };

    workflowGroup.children.forEach((child) => {
      child.form.config.forEach((field) => {
        if (!isNullOrEmpty(field.hint)) {
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
    const loadSaveStateDialogRef =
      this._dialog.open(LaunchPadServiceIdSwitchDialogComponent, { data: event.serviceId + ' [' + event.productId + ']' });

    loadSaveStateDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result === true) {

        this.context.serviceId = event.serviceId;
        this.context.productId = event.productId;

        this._loadParentWorkflow();
        this._updateServiceId(this.context.serviceId);
        this._changeDetector.markForCheck();
      } else {

        this.context.serviceId = event.serviceId;
        this._updateServiceId(this.context.serviceId);
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

  private _loadParentWorkflow(): void {
    let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);

    let parent: WorkflowData = {
      id: workflowGroup.parent.id,
      serviceId: this.context.serviceId,
      propertyOverrides: [],
    };

    let requiresCrispData = !isNullOrEmpty(workflowGroup.parent.form?.mapCrispElementAttributes);

    if (requiresCrispData) {
      this._getParentWorkflowCrispData(workflowGroup, parent);
      return;
    }

    this._context.config = {
      id: this.context.workflowGroupId,
      parent,
      children: []
    };

    this._renderWorkflowGroup(this.context.config);
    this._changeDetector.markForCheck();
  }

  private _getParentWorkflowCrispData(workflowGroup: WorkflowGroup, parent: WorkflowData): void {
    this._apiService.getCrispElement(this.context.productId)
    .pipe(
      catchError((error: McsApiErrorContext) => {

        // Ensures the context of the form is set for loading options during failure
        let requiresContextMapping = !isNullOrEmpty(workflowGroup.parent.form.mapContext);
        if (requiresContextMapping) {
          parent.propertyOverrides = workflowGroup.parent.form.mapContext(this.context);
        }

        this._context.config = {
          id: this.context.workflowGroupId,
          parent,
          children: []
        };

        if (error?.details?.status !== 404) {
          this._snackBar.open('Unable to retrieve object from CRISP.', 'OK', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }

        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP element failed.');
      })
    )
    .subscribe((response) => {
      // Sets the preselected values of the form
      let hasContextMapper = !isNullOrEmpty(workflowGroup.parent.form.mapContext);
      if (hasContextMapper) {
        parent.propertyOverrides = workflowGroup.parent.form.mapContext(this.context);
      }
      let hasCrispDataMapper = !isNullOrEmpty(workflowGroup.parent.form.mapCrispElementAttributes);
      if (hasCrispDataMapper) {
        let crispOverrides = workflowGroup.parent.form.mapCrispElementAttributes(response.serviceAttributes);
        parent.propertyOverrides = parent.propertyOverrides.concat(crispOverrides);
      }

      this._context.config = {
        id: this.context.workflowGroupId,
        parent,
        children: []
      };

      let childRequiresCrispData = !isNullOrEmpty(workflowGroup.children) && !isNullOrEmpty(response.associatedServices);
      if (!childRequiresCrispData) {
        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();
        return;
      }

      this._parentServiceRetrieved.emit(response.associatedServices);
    });
  }

  private _listenToParentServiceRetrieval(): void {
    this._parentServiceRetrieved.subscribe((childServices: McsObjectCrispElementService[]) => {

      let workflowGroup = this._getWorkflowGroupById(this.context.workflowGroupId);
      let tasks$ = this._createAssociatedServiceTasks(workflowGroup, childServices);

      // Load workflow UI if no associated services
      if (isNullOrEmpty(tasks$)) {
        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();
        return;
      }

      // Retrieve data for associated services
      forkJoin(tasks$)
      .pipe(catchError((error) => {
        // Ensures the context of the form is set for loading options during failure
        let children: WorkflowData[] = [];
        workflowGroup.children.forEach((child) => {
          let propertyOverrides = [];
          if (!isNullOrEmpty(child.form.mapContext)) {
            propertyOverrides = child.form.mapContext(this.context);
          }

          children.push({
            id: child.id,
            propertyOverrides
          });
        });

        if (error?.details?.status !== 404) {
          this._snackBar.open('Unable to retrieve associated object from CRISP.', 'OK', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }

        this.context.config.children = children;
        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP associated CRISP elements failed.');
      }))
      .subscribe((results: McsObjectCrispElement[]) => {
        let children: WorkflowData[] = [];

        // Map each CRISP attributes as propertyOverride
        workflowGroup.children.forEach((child) => {
          let crispElement = results.find((result) => result.productType.toString() === ProductType[child.crispProductType]);

          let propertyOverrides = [];
          if (!isNullOrEmpty(child.form.mapContext)) {
            propertyOverrides = child.form.mapContext(this.context);
          }
          if (!isNullOrEmpty(child.form.mapCrispElementAttributes)) {
            let crispOverrides = child.form.mapCrispElementAttributes(crispElement?.serviceAttributes);
            propertyOverrides = propertyOverrides.concat(crispOverrides);
          }

          children.push({
            id: child.id,
            propertyOverrides
          });
        });

        this.context.config.children = children;
        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();
      });
    });
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

  private _updateServiceId(serviceId: string): void {
    this.workflowComponentRef.forEach(ref => {
      if (!isNullOrEmpty(ref.instance.serviceId)) {
        ref.instance.serviceId = serviceId;
      }
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupConfig): void {
    let workflows: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.context.serviceId = config.parent.serviceId;

    // Clear references and instances of existing workflow
    this.workflowComponentRef = [];
    this.workflowGroup.viewContainerRef.clear();

    if (isNullOrEmpty(workflows)) {
      return;
    }
    // Render workflows
    workflows.forEach(workflow => {
      this._renderWorkflow(workflow);
    });
  }

  private _renderWorkflow(param: LaunchPadWorkflow): void {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(LaunchPadWorkflowComponent);
    let componentRef = this.workflowGroup.viewContainerRef.createComponent<LaunchPadWorkflowComponent>(componentFactory);

    // Set workflow settings
    componentRef.instance.initialize(param);
    if (param.hasValueOverride) {
      componentRef.instance.open();
    }

    this.workflowComponentRef.push(componentRef);
  }

  private _getWorkflowGroupById(id: WorkflowGroupId): WorkflowGroup {
    let workflowGroupType = workflowGroupMap.get(this.context.workflowGroupId);
    return new workflowGroupType();
  }
}
