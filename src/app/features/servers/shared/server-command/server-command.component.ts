import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { CoreDefinition } from '../../../../core';
import { ServerCommand } from '../../models';

@Component({
  selector: 'mcs-server-command',
  styleUrls: ['./server-command.component.scss'],
  templateUrl: './server-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerCommandComponent {
  @Input()
  public command: ServerCommand;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get startStatus(): any {
    return (this.command === ServerCommand.Stop) ? undefined : true;
  }

  public get stopStatus(): any {
    return (this.command === ServerCommand.Start ||
      this.command === ServerCommand.Restart) ?
      undefined : true;
  }

  public get restartStatus(): any {
    return (this.command === ServerCommand.Start) ? undefined : true;
  }

  constructor() {
    this.command = ServerCommand.Start;
  }

  public onExecuteCommand(commandType: string, element: HTMLElement) {
    if (element.hasAttribute('disabled')) { return; }

    this.command = ServerCommand.None;
    this.popoverActionElement.close();
    this.onClick.emit(commandType);
  }
}
