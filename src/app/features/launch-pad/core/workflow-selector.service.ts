import {
  Injectable,
  Type
} from '@angular/core';
import { ProductType } from '@app/models';
import { WorkflowGroup } from './workflow-group.interface';
import { NewCvmWorkflowGroup } from './workflow-groups/new-cvm-workflow-group';

export type LaunchPadWorkflowGroupType =
    'provision-vm'
  | 'change-vm'
  | 'deprovision-vm'
  | 'provision-hids'
  | 'provision-av';

export interface LaunchPadSetting {
  type: LaunchPadWorkflowGroupType;
  serviceId?: string;
  parentServiceId?: string;
  referenceId?: string;
}

export interface WorkflowSelectorItem {
  name: string;
  description: string;
  icon: string;
}

@Injectable()
export class LaunchPadWorkflowSelectorService {
  public workflowGroups: Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>;
  public productWorkflowGroups: Map<ProductType, LaunchPadWorkflowGroupType[]>;
  public workflowGroupSelectItems: Map<LaunchPadWorkflowGroupType, WorkflowSelectorItem>;

  public constructor() {
    this._initializeWorkflowGroups();
    this._initializeProductWorkflowGroups();
    this._initializeWorkflowGroupSelectItems();
  }

  private _initializeWorkflowGroups(): void {
    this.workflowGroups = new Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>();
    this.workflowGroups.set('provision-vm', NewCvmWorkflowGroup);
  }

  private _initializeProductWorkflowGroups(): void {
    this.productWorkflowGroups = new Map<ProductType, LaunchPadWorkflowGroupType[]>();
    this.productWorkflowGroups.set(ProductType.VmBackup, [
      'provision-vm',
      'change-vm',
      'deprovision-vm',
    ]);
  }

  private _initializeWorkflowGroupSelectItems(): void {
    this.workflowGroupSelectItems = new Map<LaunchPadWorkflowGroupType, WorkflowSelectorItem>();
    this.workflowGroupSelectItems.set('provision-vm', {
      name: 'Provision VM',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'add',
    });
    this.workflowGroupSelectItems.set('change-vm', {
      name: 'Change VM',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'edit',
    });
    this.workflowGroupSelectItems.set('deprovision-vm', {
      name: 'Deprovision VM',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'remove',
    });
    this.workflowGroupSelectItems.set('provision-hids', {
      name: 'Provision HIDS',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'add',
    });
    this.workflowGroupSelectItems.set('provision-av', {
      name: 'Provision Anti-Virus',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'add',
    });
  }
}
