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
import { McsAssetsProvider } from '../../../../core';
import {
  ServerPowerState,
  ServerCommand
} from '../../models';

@Component({
  selector: 'mcs-server-command',
  styles: [require('./server-command.component.scss')],
  templateUrl: './server-command.component.html'
})
export class ServerCommandComponent implements OnInit {
  public gear: string;

  @Input()
  public command: ServerCommand;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  constructor(
    private _assetsProvider: McsAssetsProvider
  ) {
    this.command = ServerCommand.Start;
  }

  public ngOnInit() {
    this.gear = this._assetsProvider.getIcon('gear');
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
