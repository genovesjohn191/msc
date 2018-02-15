import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  QueryList,
  ViewEncapsulation,
  ChangeDetectionStrategy
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
import { McsTextContentProvider } from '../../../../core';
import { isNullOrEmpty } from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';

@Component({
  selector: 'mcs-create-self-managed-server',
  templateUrl: './create-self-managed-server.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class CreateSelfManagedServerComponent implements OnInit {

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

  @ViewChildren('createServerInstance')
  public createServerInstance: QueryList<any>;

  // Form variables
  public formGroupCreateServer: FormGroup;
  public formControlServerName: FormControl;

  // Others
  public activeCreationTabId: any;
  public contextualTextContent: any;
  public textContent: any;
  public serverName: string;
  public serverCreateTypeEnum = ServerCreateType;
  public paramSubscription: Subscription;

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
  public get isValid(): boolean {
    return this._serverInputs.isValid;
  }

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute
  ) {
    this._serverCreateType = ServerCreateType.New;
    this._serverInputs = new ServerCreateSelfManaged();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.textContent.contextualHelp;
    this._setCreationType();
  }

  /**
   * Return true when all the forms are touched and changes are made, otherwise false
   */
  public hasDirtyFormControls(): boolean {
    let touchedDirty: boolean = false;
    if (isNullOrEmpty(this.createServerInstance)) { return; }

    // Mark all controls of child component to touched and scroll to first invalid element;
    this.createServerInstance.map((createComponent) => {
      if (createComponent.createType === this.activeCreationTabId) {
        if (createComponent.fgCreateDirective) {
          touchedDirty = createComponent.fgCreateDirective.hasDirtyFormControls();
        }
      }
    });
    return touchedDirty;
  }

  /**
   * This will mark all children form controls to touched
   */
  public validateComponentFormControls(): void {
    if (isNullOrEmpty(this.createServerInstance)) { return; }

    // Mark all controls of child component to touched and scroll to first invalid element;
    this.createServerInstance.map((createComponent) => {
      if (createComponent.createType === this.activeCreationTabId) {
        if (createComponent.fgCreateDirective) {
          createComponent.fgCreateDirective.validateFormControls(true);
        }
      }
    });
  }

  /**
   * Set the server details based on the inputted information
   * @param _serverDetails Server details
   */
  public setServerDetails(_serverDetails: ServerCreateSelfManaged): void {
    if (isNullOrEmpty(_serverDetails)) { return; }
    this._serverInputs = _serverDetails;
  }

  /**
   * Event that emits when tab is changed
   */
  public onTabChanged(_event) {
    this.activeCreationTabId = _event.id;
  }

  /**
   * Set the target server
   */
  private _setCreationType(): void {
    this.paramSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        let serverId = params['clone'];
        if (!isNullOrEmpty(serverId)) {
          this._serverCreateType = ServerCreateType.Clone;
        }
      });
  }
}
