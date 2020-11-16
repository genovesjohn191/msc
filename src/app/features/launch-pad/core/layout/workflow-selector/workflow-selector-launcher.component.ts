import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { LaunchPadWorkflowSelectorComponent, WorkflowSelectorConfig } from './workflow-selector.component';

@Component({
  selector: 'mcs-workflow-selector-launcher',
  templateUrl: 'workflow-selector-launcher.component.html'
})
export class WorkflowSelectorLauncherComponent {

  @Input()
  public config: WorkflowSelectorConfig;

  @Output()
  public selected: EventEmitter<WorkflowSelectorConfig>;

  public constructor(private _bottomSheet: MatBottomSheet,) {
    this.selected = new EventEmitter();
  }

  public onClick(): void {
    this._bottomSheet.open(LaunchPadWorkflowSelectorComponent, { data: this.config });
  }
}
