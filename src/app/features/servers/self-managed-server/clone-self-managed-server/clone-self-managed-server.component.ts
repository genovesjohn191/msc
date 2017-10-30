import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsTextContentProvider,
  CoreValidators,
  CoreDefinition
} from '../../../../core';
import {
  ServerCreateSelfManaged,
  Server,
  ServerCreateType
} from '../../models';
import {
  refreshView,
  mergeArrays,
  isNullOrEmpty
} from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';

const TARGET_SERVER_PLACEHOLDER = 'Select Server';

@Component({
  selector: 'mcs-clone-self-managed-server',
  templateUrl: './clone-self-managed-server.component.html'
})

export class CloneSelfManagedServerComponent implements OnInit, AfterViewInit {
  @Input()
  public visible: boolean;

  @Input()
  public targetServer: string;

  @Input()
  public servers: Server[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupCloneServer: FormGroup;
  public formControlTargetServer: FormControl;

  // Others
  public noServersTextContent: any;
  public contextualTextContent: any;

  public get targetServerPlaceholder(): string {
    return TARGET_SERVER_PLACEHOLDER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get hasServers(): boolean {
    return !isNullOrEmpty(this.servers);
  }

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.noServersTextContent = this._textContentProvider.content
    .servers.createSelfManagedServer.noServers;

    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this._registerFormGroup();

    if (isNullOrEmpty(this.targetServer) && this.hasServers) {
      this.targetServer = this.servers[0].id;
    }
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        let contextInformations: ContextualHelpDirective[];
        contextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
        this._managedServerService.subContextualHelp =
          mergeArrays(this._managedServerService.subContextualHelp, contextInformations);
      }

      this.formControlTargetServer.setValue(this.targetServer);
    });
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlTargetServer = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.formGroupCloneServer = new FormGroup({
      formControlTargetServer: this.formControlTargetServer
    });
    this.formGroupCloneServer.statusChanges.subscribe(() => {
      this._outputServerDetails();
    });
  }

  private _outputServerDetails(): void {
    let cloneSelfManaged: ServerCreateSelfManaged;
    cloneSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    cloneSelfManaged.type = ServerCreateType.Clone;
    cloneSelfManaged.targetServer = this.formControlTargetServer.value;
    cloneSelfManaged.isValid = this.formGroupCloneServer.valid;
    this.onOutputServerDetails.next(cloneSelfManaged);
  }
}
