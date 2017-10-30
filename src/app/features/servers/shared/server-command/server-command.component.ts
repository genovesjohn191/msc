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
import { ServerCommand } from '../../models';
import { isNullOrEmpty } from '../../../../utilities';

@Component({
  selector: 'mcs-server-command',
  templateUrl: './server-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerCommandComponent implements OnInit {
  @Input()
  public commandList: ServerCommand[];

  @Input()
  public command: ServerCommand;

  @Output()
  public onClick: EventEmitter<ServerCommand> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  public textContent: any;

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  constructor(private _textProvider: McsTextContentProvider) {
    this.command = ServerCommand.Start;
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers;
    this._setServerCommandList();
  }

  public getServerCommandLabel(value: ServerCommand): string {
    let label: string;

    switch (value) {
      case ServerCommand.Start:
        label = this.textContent.start;
        break;

      case ServerCommand.Restart:
        label = this.textContent.restart;
        break;

      case ServerCommand.Stop:
        label = this.textContent.stop;
        break;

      case ServerCommand.Scale:
        label = this.textContent.scale;
        break;

      case ServerCommand.Clone:
        label = this.textContent.clone;
        break;

      case ServerCommand.ViewVCloud:
        label = this.textContent.vcloud;
        break;

      case ServerCommand.ResetVmPassword:
        label = this.textContent.resetVmPassword;
        break;

      default:
        label = '';
        break;
    }

    return label;
  }

  public onExecuteCommand(command: ServerCommand) {
    if (command === ServerCommand.Start ||
      command === ServerCommand.Stop ||
      command === ServerCommand.Restart) {
      this.command = ServerCommand.None;
    }
    if (this.popoverActionElement) {
      this.popoverActionElement.close();
    }
    this.onClick.emit(command);
  }

  public disableAction(command: ServerCommand): boolean {
    let disabled: boolean;

    switch (this.command) {
      case ServerCommand.Start:
        disabled = command === ServerCommand.Start;
        break;

      case ServerCommand.Stop:
        disabled = command === ServerCommand.Stop || command === ServerCommand.Restart;
        break;

      case ServerCommand.None:
        disabled = command !== ServerCommand.ViewVCloud;
        break;

      default:
        disabled = false;
        break;
    }

    return disabled;
  }

  private _setServerCommandList(): void {
    if (!isNullOrEmpty(this.commandList)) { return; }

    let commands = Object.keys(ServerCommand);

    this.commandList = commands.slice(0, commands.length / 2).map(Number);
  }
}
