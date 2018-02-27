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
  Server,
  ServerPowerState
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
  public server: Server;

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
    let enabled: boolean;

    switch (command) {
      case ServerCommand.Start:
        enabled = this.server.executable &&
          this.server.powerState === ServerPowerState.PoweredOff;
        break;

      case ServerCommand.Stop:
      case ServerCommand.Restart:
      case ServerCommand.Suspend:
        enabled = this.server.executable &&
          this.server.powerState === ServerPowerState.PoweredOn;
        break;

      case ServerCommand.ViewVCloud:
        enabled = this.server.commandAction !== ServerCommand.Delete;
        break;

      case ServerCommand.Resume:
        enabled = this.server.resumable;
        break;

      case ServerCommand.Delete:
        enabled = !this.server.isProcessing && !this.server.resumable;
        break;

      default:
        enabled = this.server.executable;
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
