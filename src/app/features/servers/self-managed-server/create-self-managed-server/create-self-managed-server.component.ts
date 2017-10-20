import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import {
  Server,
  ServerCreateType,
  ServerCreateSelfManaged,
  ServerResource,
  ServerGroupedOs
} from '../../models';
import {
  CoreDefinition,
  CoreValidators,
  McsTextContentProvider
} from '../../../../core';
import {
  mergeArrays,
  refreshView,
  isFormControlValid
} from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';

const SERVER_NAME_MAX = 15;

@Component({
  selector: 'mcs-create-self-managed-server',
  templateUrl: './create-self-managed-server.component.html',
  styleUrls: ['./create-self-managed-server.component.scss']
})

export class CreateSelfManagedServerComponent implements OnInit, AfterViewInit {
  @Input()
  public vdcName: string;

  @Input()
  public resource: ServerResource;

  @Input()
  public serversOs: ServerGroupedOs[];

  @Input()
  public servers: Server[];

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupCreateServer: FormGroup;
  public formControlServerName: FormControl;

  // Others
  public contextualTextContent: any;
  public createServerTextContent: any;
  public serverName: string;
  public serverCreateTypeEnum = ServerCreateType;
  public paramSubscription: Subscription;
  public targetServerId: string;

  /**
   * Get the current creation type of the server
   * `New, Copy, Clone`
   */
  private _serverCreateType: ServerCreateType;
  public get serverCreateType(): ServerCreateType {
    return this._serverCreateType;
  }
  public set serverCreateType(value: ServerCreateType) {
    if (this._serverCreateType !== value) {
      this._serverCreateType = value;
    }
  }

  /**
   * Get the server inputted based on the current server type
   *
   * `@Note`: This property is undefined until all the required
   * value in the server are filled out
   */
  private _serverInputs: ServerCreateSelfManaged;
  public get serverInputs(): ServerCreateSelfManaged {
    return this._serverInputs;
  }

  /**
   * Get the valid flag of the form
   */
  private _isValid: boolean;
  public get isValid(): boolean {
    return this._serverInputs.isValid && this.formGroupCreateServer.valid;
  }

  private _serverNew: ServerCreateSelfManaged;
  private _serverCopy: ServerCreateSelfManaged;
  private _serverClone: ServerCreateSelfManaged;

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute
  ) {
    this._serverCreateType = ServerCreateType.New;
    this._serverInputs = new ServerCreateSelfManaged();
    this._isValid = false;
    this._serverNew = new ServerCreateSelfManaged();
    this._serverCopy = new ServerCreateSelfManaged();
    this._serverClone = new ServerCreateSelfManaged();
  }

  public ngOnInit() {
    this.createServerTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.createServerTextContent.contextualHelp;

    this._setTargetServer();
    this._registerFormGroup();
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

  public setCreationType(type: ServerCreateType): void {
    this._serverCreateType = type;

    switch (type) {
      case ServerCreateType.Copy:
        this._serverInputs = this._serverCopy;
        break;

      case ServerCreateType.Clone:
        this._serverInputs = this._serverClone;
        break;

      case ServerCreateType.New:
      default:
        this._serverInputs = this._serverNew;
        break;
    }
  }

  public setServerDetails($serverDetails: ServerCreateSelfManaged): void {
    if (!$serverDetails) { return; }

    switch ($serverDetails.type) {
      case ServerCreateType.Copy:
        this._serverCopy = $serverDetails;
        break;

      case ServerCreateType.Clone:
        this._serverClone = $serverDetails;
        break;

      case ServerCreateType.New:
      default:
        this._serverNew = $serverDetails;
        break;
    }

    this.setCreationType(this._serverCreateType);
  }

  public isControlValid(control: any): boolean {
    return isFormControlValid(control);
  }

  private _setTargetServer(): void {
    this.paramSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        this.targetServerId = params['clone'];
        if (this.targetServerId) {
          this.setCreationType(ServerCreateType.Clone);
        }
      });
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlServerName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.maxLength(SERVER_NAME_MAX),
      CoreValidators.custom(
        this._customServerNameValidator.bind(this),
        this.createServerTextContent.invalidServerName
      )
    ]);
    this.formControlServerName.valueChanges
      .subscribe((inputValue) => {
        this.serverName = inputValue;
      });

    // Register Form Groups using binding
    this.formGroupCreateServer = new FormGroup({
      formControlServerName: this.formControlServerName
    });
  }

  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }
}
