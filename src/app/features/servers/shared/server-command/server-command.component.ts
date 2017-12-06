import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';
import {
  ServerCommand,
  ServerClientObject,
  ServerPowerState,
  ServerServiceType
} from '../../models';
import { isNullOrEmpty } from '../../../../utilities';

@Component({
  selector: 'mcs-server-command',
  templateUrl: './server-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerCommandComponent implements OnInit {
  @Input()
  public serverStatus: ServerClientObject;

  @Input()
  public excluded: ServerCommand[];

  @Output()
  public onClick: EventEmitter<ServerCommand> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  public textContent: any;

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get serverCommandEnum() {
    return ServerCommand;
  }

  constructor(private _textProvider: McsTextContentProvider) {
    this.excluded = new Array<ServerCommand>();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers;
  }

  public onExecuteCommand(command: ServerCommand) {
    if (this.popoverActionElement) {
      this.popoverActionElement.close();
    }
    this.onClick.emit(command);
  }

  public getEnabledCommand(command: ServerCommand): boolean {
    let enabled = true;

    switch (command) {
      case ServerCommand.Start:
        enabled = this.serverStatus.powerState === ServerPowerState.PoweredOff;
        break;

      case ServerCommand.Stop:
        enabled = this.serverStatus.powerState === ServerPowerState.PoweredOn;
        break;

      case ServerCommand.Restart:
        enabled = this.serverStatus.powerState === ServerPowerState.PoweredOn;
        break;

      case ServerCommand.Delete:
        enabled = !isNullOrEmpty(this.serverStatus.powerState) &&
          this.serverStatus.serviceType === ServerServiceType.SelfManaged;
        break;

      case ServerCommand.ViewVCloud:
        enabled = this.serverStatus.commandAction !== ServerCommand.Delete;
        break;

      default:
        enabled = !isNullOrEmpty(this.serverStatus.powerState);
        break;
    }

    return enabled;
  }

  public getIncludedCommand(command: ServerCommand): boolean {
    let included = true;

    if (!isNullOrEmpty(this.excluded)) {
      included = isNullOrEmpty(this.excluded.find((excludedCommand) => {
        return excludedCommand === command;
      }));
    }

    return included;
  }
}
