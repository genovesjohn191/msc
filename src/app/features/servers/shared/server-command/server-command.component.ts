import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsUniqueId
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsServer,
  ServerCommand
} from '@app/models';

@Component({
  selector: 'mcs-server-command',
  templateUrl: './server-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id'
  }
})
export class ServerCommandComponent {
  @Input()
  public server: McsServer;

  @Input()
  public excluded: ServerCommand[];

  @Input()
  public id: string;

  @Output()
  public onClick: EventEmitter<ServerCommand> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get serverCommandEnum() {
    return ServerCommand;
  }

  constructor() {
    this.id = McsUniqueId.NewId('server-command');
    this.excluded = new Array<ServerCommand>();
  }

  public onExecuteCommand(command: ServerCommand) {
    if (this.popoverActionElement) {
      this.popoverActionElement.close();
    }
    this.onClick.emit(command);
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
