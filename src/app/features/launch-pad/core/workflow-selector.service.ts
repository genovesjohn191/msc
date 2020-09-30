import {
  Injectable,
  Type
} from '@angular/core';
import { ProductType } from '@app/models';
import { WorkflowGroup } from './workflow-group.interface';
import { ChangeVmWorkflowGroup, ProvisionVmWorkflowGroup } from './workflows';

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
  properties?: { key: string, value: any }[];
}

export interface WorkflowSelectorConfig {
  type: ProductType;
  name: string;
  serviceId?: string;
  parentServiceId?: string;
  properties?: { key: string, value: any }[];
}

export interface WorkflowSelectorItem {
  name: string;
  description: string;
  type: LaunchPadWorkflowGroupType;
  icon: string;
}

@Injectable()
export class LaunchPadWorkflowSelectorService {
  public workflowGroups: Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>;
  public workflowSelectionGroups: Map<ProductType, LaunchPadWorkflowGroupType[]>;
  public workflowSelectionGroupItems: Map<LaunchPadWorkflowGroupType, WorkflowSelectorItem>;

  public constructor() {
    this._initializeWorkflowGroups();
    this._initializeSelectionGroups();
    this._initializeSelectionGroupItems();
  }

  private _initializeWorkflowGroups(): void {
    this.workflowGroups = new Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>();
    this.workflowGroups.set('provision-vm', ProvisionVmWorkflowGroup);
    this.workflowGroups.set('change-vm', ChangeVmWorkflowGroup);
  }

  private _initializeSelectionGroups(): void {
    this.workflowSelectionGroups = new Map<ProductType, LaunchPadWorkflowGroupType[]>();
    this.workflowSelectionGroups.set(ProductType.VirtualManagedServer, [
      'provision-vm',
      'change-vm',
      'deprovision-vm',
    ]);
    this.workflowSelectionGroups.set(ProductType.ServerAntiVirus, [
      'provision-av'
    ]);
  }

  private _initializeSelectionGroupItems(): void {
    this.workflowSelectionGroupItems = new Map<LaunchPadWorkflowGroupType, WorkflowSelectorItem>();
    this.workflowSelectionGroupItems.set('provision-vm', {
      name: 'Provision VM',
      type: 'provision-vm',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'add',
    });
    this.workflowSelectionGroupItems.set('change-vm', {
      name: 'Change VM',
      type: 'change-vm',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'edit',
    });
    this.workflowSelectionGroupItems.set('deprovision-vm', {
      name: 'Deprovision VM',
      type: 'change-vm',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'remove',
    });
    this.workflowSelectionGroupItems.set('provision-hids', {
      name: 'Provision HIDS',
      type: 'change-vm',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'add',
    });
    this.workflowSelectionGroupItems.set('provision-av', {
      name: 'Provision Anti-Virus',
      type: 'provision-av',
      description: 'Lorem ipsum dolor sit amet.',
      icon: 'add',
    });
  }
}
