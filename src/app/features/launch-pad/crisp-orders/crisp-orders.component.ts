import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  ChangeDetectionStrategy, ViewChild
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatBottomSheet, MatTreeNestedDataSource } from '@angular/material';
import { isNullOrEmpty } from '@app/utilities';
import { Observable, of } from 'rxjs';
import { LaunchPadComponent } from '../core';
import { LaunchPadWorkflowSelectorComponent } from '../core/workflow-selector.component';
import { Workflow } from '../core/workflow.interface';
import { LaunchPadSetting } from '../core/workflow.service';

interface OrderItemNode {
  name: string;
  type?: string;
  orderItemId?: string;
  children?: OrderItemNode[];
}

const TREE_DATA: OrderItemNode[] = [
  {
    name: '#12345 - New Managed Server',
    children: [
      {
        name: 'Virtual Machines',
        children: [
          {
            name: 'MXCVM12345678',
            type: 'new-cvm',
            children: [{
              type: 'new-hids',
              name: 'HIDS',

            }]
          },
          {name: 'MIBSV12345678'},
        ]
      }, {
        name: 'VDC Storage',
        children: [
          {name: 'M1VS12345678'}
        ]
      },
    ]
  },
  {
    name: '#54321 - New Managed Server',
    children: [
      {
        name: 'Virtual Machines',
        children: [
          {name: 'MXCVM87654321'},
          {name: 'MIBSV87654321'},
        ]
      }, {
        name: 'VDC Storage',
        children: [
          {name: 'M1VS87654321'}
        ]
      },
    ]
  },
];

@Component({
  selector: 'mcs-launch-pad-crisp-orders',
  templateUrl: './crisp-orders.component.html',
  styleUrls: ['./crisp-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrdersWorkflowComponent {
  @ViewChild('launchPad', { static: false})
  protected launchPad: LaunchPadComponent;

  public config$: Observable<LaunchPadSetting>;

  public workflowPayload: Workflow[] = [];

  public treeControl = new NestedTreeControl<OrderItemNode>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<OrderItemNode>();
  public hasChild = (_: number, node: OrderItemNode) => !!node.children && node.children.length > 0;

  constructor(private _bottomSheet: MatBottomSheet) {
    this.dataSource.data = TREE_DATA;
    this.createWorkflowGroup({type: 'provision-vm', serviceId: 'MVC222222', parentServiceId: 'test2'});
  }

  public get valid(): boolean {
    if (isNullOrEmpty(this.launchPad)) {
      return false;
    }
    return this.launchPad.valid;
  }

  public createWorkflowGroup(settings: LaunchPadSetting): void {
    this.config$ = of(settings);
  }

  public parse(payload: any): string {
    return JSON.stringify(payload, null, 2);
  }

  public clickNode(): void {
    this._bottomSheet.open(LaunchPadWorkflowSelectorComponent, { data: { type: 'new-cvm'} });
  }
}
