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
  McsList,
  McsListItem,
  McsTextContentProvider,
  CoreValidators
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

@Component({
  selector: 'mcs-clone-self-managed-server',
  templateUrl: './clone-self-managed-server.component.html',
  styleUrls: ['./clone-self-managed-server.component.scss']
})

export class CloneSelfManagedServerComponent implements OnInit, AfterViewInit {
  @Input()
  public visible: boolean;

  @Input()
  public servers: Server[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupCloneServer: FormGroup;
  public formControlTargetServerName: FormControl;

  // Others
  public serverItems: McsList;
  public contextualTextContent: any;
  public selectedServer: Server;

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.serverItems = new McsList();
    this.selectedServer = new Server();
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this._registerFormGroup();
    this._setServerItems();
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
    });
  }

  private _setServerItems(): void {
    if (!this.servers) { return; }

    // Populate dropdown list
    this.servers.forEach((server) => {
      this.serverItems.push('Servers',
        new McsListItem(server.id, server.managementName));
    });

    // Select first element of the dropdown
    if (!isNullOrEmpty(this.serverItems.getGroupNames())) {
      this.formControlTargetServerName.setValue(this.servers[0].id);
      this.selectedServer = this.servers[0];
    }
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlTargetServerName = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.formGroupCloneServer = new FormGroup({
      formControlTargetServerName: this.formControlTargetServerName
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
    cloneSelfManaged.targetServerName = this.formControlTargetServerName.value;
    cloneSelfManaged.isValid = this.formGroupCloneServer.valid;
    this.onOutputServerDetails.next(cloneSelfManaged);
  }
}
