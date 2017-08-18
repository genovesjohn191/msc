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
  Server
} from '../../models';
import {
  refreshView,
  mergeArrays
} from '../../../../utilities';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';
import { ContextualHelpDirective } from '../../shared/contextual-help/contextual-help.directive';

@Component({
  selector: 'mcs-clone-self-managed-server',
  templateUrl: './clone-self-managed-server.component.html',
  styles: [require('./clone-self-managed-server.component.scss')]
})

export class CloneSelfManagedServerComponent implements OnInit, AfterViewInit {
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

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.serverItems = new McsList();
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
      this.serverItems.push('Servers', new McsListItem(
        server.managementName, server.managementName));
    });
    // Select first element of the dropdown
    if (this.serverItems) {
      this.formControlTargetServerName.setValue(this.serverItems.getGroup(
        this.serverItems.getGroupNames()[0])[0].value);
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
    this.formGroupCloneServer.statusChanges.subscribe((status) => {
      this._outputServerDetails();
    });
  }

  private _outputServerDetails(): void {
    let cloneSelfManaged: ServerCreateSelfManaged;
    cloneSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    cloneSelfManaged.targetServerName = this.formControlTargetServerName.value;
    cloneSelfManaged.isValid = this.formGroupCloneServer.valid;
    this.onOutputServerDetails.next(cloneSelfManaged);
  }
}
