import { Injectable } from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { workflowOptions } from './workflow-options.map';
import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';

export interface WorkflowSelectorItem {
  name: string;
  id: WorkflowGroupId;
  description: string;
  icon: string;
}

@Injectable()
export class LaunchPadWorkflowSelectorService {
  public getOptionsById(ids: WorkflowGroupId[]): WorkflowSelectorItem[] {
    let items: WorkflowSelectorItem[] = [];

    if (isNullOrEmpty(ids)) {
      return items;
    }

    ids.forEach(id => {
      let option = workflowOptions.get(id);
      if (!isNullOrEmpty(option)) {
        items.push(option);
      }
    });

    return items;
  }
}
