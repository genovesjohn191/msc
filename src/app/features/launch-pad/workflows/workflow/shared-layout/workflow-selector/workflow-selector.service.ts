import { Injectable } from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { workflowOptions } from '../workflow-options.map';
import { WorkflowGroupId, workflowGroupIdText } from '../../core/workflow-groups/workflow-group-type.enum';

export interface WorkflowSelectorItem {
  id: WorkflowGroupId;
  name: string;
  description: string;
}

@Injectable()
export class LaunchPadWorkflowSelectorService {
  public getOptionsById(ids: WorkflowGroupId[]): WorkflowSelectorItem[] {
    let items: WorkflowSelectorItem[] = [];

    if (isNullOrEmpty(ids)) {
      return items;
    }

    ids.forEach(id => {
      let description = workflowOptions.get(id);
      if (!isNullOrEmpty(description)) {
        items.push({
          id,
          name: workflowGroupIdText[id],
          description
        });
      }
    });

    return items;
  }
}
