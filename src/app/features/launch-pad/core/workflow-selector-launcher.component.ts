import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkflowSelectorConfig } from './workflow-selector.component';

@Component({
  selector: 'mcs-workflow-selector-launcher',
  templateUrl: 'workflow-selector-launcher.component.html'
})
export class WorkflowSelectorLauncherComponent {

  @Input()
  public config: WorkflowSelectorConfig;

  @Output()
  public selected: EventEmitter<WorkflowSelectorConfig>;

  public constructor() {
    this.selected = new EventEmitter();
  }
  public onClick(): void {
    this.selected.emit(this.config);
  }
}
