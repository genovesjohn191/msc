import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CoreDefinition } from '../../../../core';
import {
  ServerPowerState,
  ServerCommand
} from '../../models';

@Component({
  selector: 'mcs-server-command',
  styles: [require('./server-command.component.scss')],
  templateUrl: './server-command.component.html'
})
export class ServerCommandComponent {
  @Input()
  public command: ServerCommand;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_FONT_GEAR;
  }

  constructor() {
    this.command = ServerCommand.Start;
  }

  public getStartStatus(): any {
    return (this.command === ServerCommand.Stop) ? undefined : true;
  }

  public getStopStatus(): any {
    return (this.command === ServerCommand.Start ||
      this.command === ServerCommand.Restart) ?
      undefined : true;
  }

  public getRestartStatus(): any {
    return (this.command === ServerCommand.Start) ? undefined : true;
  }

  public onExecuteCommand(commandType: string) {
    this.command = ServerCommand.None;
    this.popoverActionElement.close();
    this.onClick.emit(commandType);
  }
}
