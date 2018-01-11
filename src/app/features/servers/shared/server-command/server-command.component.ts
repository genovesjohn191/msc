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

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-server-command',
  templateUrl: './server-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id'
  }
})
export class ServerCommandComponent implements OnInit {
  @Input()
  public serverStatus: ServerClientObject;

  @Input()
  public excluded: ServerCommand[];

  @Input()
  public id: string;

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

  public get isServerOperable(): boolean {
    return !isNullOrEmpty(this.serverStatus.powerState) && this.serverStatus.isOperable;
  }

  public get isServerSelfManaged(): boolean {
    return this.serverStatus.serviceType === ServerServiceType.SelfManaged;
  }

  constructor(private _textProvider: McsTextContentProvider) {
    this.id = `mcs-server-command-${nextUniqueId++}`;
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
        enabled = this.isServerOperable &&
          this.serverStatus.powerState === ServerPowerState.PoweredOff;
        break;

      case ServerCommand.Stop:
      case ServerCommand.Restart:
        enabled = this.isServerOperable &&
          this.serverStatus.powerState === ServerPowerState.PoweredOn;
        break;

      case ServerCommand.Delete:
        enabled = !isNullOrEmpty(this.serverStatus.powerState) && this.isServerSelfManaged;
        break;

      case ServerCommand.ViewVCloud:
        enabled = this.serverStatus.commandAction !== ServerCommand.Delete;
        break;

      default:
        enabled = this.isServerOperable && this.isServerSelfManaged;
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
