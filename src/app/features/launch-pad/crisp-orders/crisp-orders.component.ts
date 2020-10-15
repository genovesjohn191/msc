import { Subscription } from 'rxjs';

import { NestedTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { McsEvent } from '@app/events';
import { ProductType } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { LaunchPadComponent } from '../core/launch-pad-core.component';
import {
  LaunchPadWorkflowSelectorComponent,
  WorkflowSelectorConfig
} from '../core/layout/workflow-selector.component';
import { WorkflowGroupConfig } from '../core/workflows/workflow-group.interface';
import { Workflow } from '../core/workflows/workflow.interface';

interface OrderItemNode {
  name: string;
  config?: WorkflowSelectorConfig;
  children?: OrderItemNode[];
}

const TREE_DATA: OrderItemNode[] = [
  {
    name: '#00001 - New Managed Server',
    children: [
      {
        name: 'Virtual Machines',
        children: [
          {
            name: 'MXCVM1111111',
            config: {
              label: 'MXCVM1111111',
              type: ProductType.VirtualManagedServer,
              parentServiceId: 'MXCVM1111111',
            },
            children: [{
              name: 'HIDS',
              config: {
                label: 'HIDS',
                type: ProductType.ServerHostIntrusionPreventionSystem,
              }
            }]
          }
        ]
      }
    ]
  },
  {
    name: '#00002 - Change Managed Server',
    children: [
      {
        name: 'Virtual Machines',
        children: [
          {
            name: 'webserver01',
            config: {
              label: 'webserver01',
              serviceId: 'MXCVM2222222',
              type: ProductType.VirtualManagedServer,
              properties: [
                { key: 'zone', value: 'LB1' },
                { key: 'pod', value: 'POD2' },
                { key: 'subZone', value: 'Management' },
                { key: 'vdc', value: 'M1VDC28603002' },
                { key: 'hostName', value: 'webserver01' },
                { key: 'cpu', value: 2 },
                { key: 'network', value: 'Customer_104220-V1009-APP-M1VLN279999001'},
                { key: 'ram', value: 8 },
                { key: 'disk', value: 50 }
              ]
            }
          }
        ]
      },
      {
        name: 'Host Security',
        children: [
          {
            name: 'Add Anti-Virus',
            config: {
              label: 'Add Anti-Virus',
              parentServiceId: 'MXCVM2222222',
              type: ProductType.ServerAntiVirus
            }
          }
        ]
      }
    ]
  }
];

@Component({
  selector: 'mcs-launch-pad-crisp-orders',
  templateUrl: './crisp-orders.component.html',
  styleUrls: ['./crisp-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrdersWorkflowComponent implements OnDestroy {
  @ViewChild('launchPad', { static: false})
  protected launchPad: LaunchPadComponent;

  public config: WorkflowGroupConfig;
  public workflowPayload: Workflow[] = [];
  public treeControl = new NestedTreeControl<OrderItemNode>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<OrderItemNode>();

  private _initHandler: Subscription;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this.dataSource.data = TREE_DATA;
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._initHandler);
  }

  public hasChild = (_: number, node: OrderItemNode) => !!node.children && node.children.length > 0;

  private _registerEvents(): void {
    this._initHandler = this._eventDispatcher.addEventListener(
      McsEvent.launchPadWorkflowInitEvent, this._initLaunchPad.bind(this));
  }

  private _initLaunchPad(config: WorkflowGroupConfig): void {
    this.config = config;
    this._changeDetectorRef.markForCheck();
  }

  public get valid(): boolean {
    if (isNullOrEmpty(this.launchPad)) {
      return false;
    }
    return this.launchPad.valid;
  }

  public parse(payload: any): string {
    return JSON.stringify(payload, null, 2);
  }

  public clickNode(config: WorkflowSelectorConfig): void {
    this._bottomSheet.open(LaunchPadWorkflowSelectorComponent, { data: config });
  }
}
