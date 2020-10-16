
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Subscription } from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { IMcsNavigateAwayGuard } from '@app/core';
import { McsEvent } from '@app/events';
import { ProductType } from '@app/models/enumerations/product-type.enum';
import {
  unsubscribeSafely,
  isNullOrEmpty }
  from '@app/utilities';

  import {
  LaunchPadComponent,
  LaunchPadWorkflowSelectorComponent,
  WorkflowSelectorConfig,
  WorkflowGroupConfig
} from '../core';

const TREE_DATA: WorkflowSelectorConfig[] = [
  {
    label: '#00001 - New Managed Server',
    children: [
      {
        label: 'Virtual Machines',
        children: [
          {
            label: 'new-server01',
            serviceId: 'MXCVM1111111',
            type: ProductType.VirtualManagedServer,
            properties: [
              { key: 'zone', value: 'LB1' },
              { key: 'pod', value: 'POD2' },
              { key: 'subZone', value: 'Management' },
              { key: 'vCloudInstance', value: 'vcloud101' },
              { key: 'vdc', value: 'M1VDC28603002' },
              { key: 'network', value: 'Customer_104220-V1009-APP-M1VLN279999001'},
              { key: 'hostName', value: 'new-server01' },
              { key: 'cpu', value: 4 },
              { key: 'ram', value: 9 },
              { key: 'disk', value: 66 }
            ],
            children: [
              {
                label: 'HIDS',
                type: ProductType.ServerHostIntrusionPreventionSystem,
                properties: [
                  { key: 'mode', value: 'protect' }
                ]
              },
              {
                label: 'Backup',
                type: ProductType.VmBackup,
                properties: [
                  { key: 'retention', value: '7 Days' },
                  { key: 'dailyQuota', value: 33 },
                ]
              },
            ]
          }
        ]
      }
    ]
  },
  {
    label: '#00002 - Change Managed Server',
    children: [
      {
        label: 'Virtual Machines',
        children: [
          {
            label: 'webserver01',
            serviceId: 'MXCVM2222222',
            type: ProductType.VirtualManagedServer,
            properties: [
              { key: 'zone', value: 'LB1' },
              { key: 'pod', value: 'POD2' },
              { key: 'subZone', value: 'Management' },
              { key: 'vCloudInstance', value: 'vcloud101' },
              { key: 'vdc', value: 'M1VDC28603002' },
              { key: 'hostName', value: 'webserver01' },
              { key: 'cpu', value: 2 },
              { key: 'network', value: 'Customer_104220-V1009-APP-M1VLN279999001'},
              { key: 'ram', value: 8 },
              { key: 'disk', value: 50 }
            ]
          }
        ]
      },
      {
        label: 'Host Security',
        children: [
          {
            label: 'Add Anti-Virus',
            serviceId: 'MXCVM2222222',
            type: ProductType.ServerAntiVirus
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
export class CrispOrdersWorkflowComponent implements OnDestroy, IMcsNavigateAwayGuard {
  @ViewChild('launchPad')
  protected launchPad: LaunchPadComponent;

  public config: WorkflowGroupConfig;
  public treeControl = new NestedTreeControl<WorkflowSelectorConfig>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<WorkflowSelectorConfig>();
  public companyId = '556';
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

  public canNavigateAway(): boolean {
    if (isNullOrEmpty(this.launchPad)) {
      return true;
    }

    return this.launchPad.canNavigateAway();
  }

  public hasChild = (_: number, node: WorkflowSelectorConfig) => !!node.children && node.children.length > 0;

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

  private _registerEvents(): void {
    this._initHandler = this._eventDispatcher.addEventListener(
      McsEvent.launchPadWorkflowInitEvent, this._initLaunchPad.bind(this));
  }

  private _initLaunchPad(config: WorkflowGroupConfig): void {
    this.config = config;
    this._changeDetectorRef.markForCheck();
  }
}
