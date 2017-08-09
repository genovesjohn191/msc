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
import { ServerCreateSelfManaged } from '../../models';
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
  public isVisible: boolean;

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupCloneServer: FormGroup;
  public formControlTargetServerName: FormControl;

  // Others
  public serverCatalogItems: McsList;
  public contextualTextContent: any;

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.isVisible = false;
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this._registerFormGroup();
    this.serverCatalogItems = this.getServerCatalogs();
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

  public getServerCatalogs(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Server Catalog', new McsListItem('serverCatalog1', 'mongo-db-prod 1'));
    itemList.push('Server Catalog', new McsListItem('serverCatalog2', 'mongo-db-prod 2'));
    itemList.push('Server Catalog', new McsListItem('serverCatalog3', 'mongo-db-prod 3'));
    return itemList;
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
