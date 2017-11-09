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
import {
  McsTextContentProvider,
  McsTouchedControl
} from '../../../../core';
import { isNullOrEmpty } from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';

@Component({
  selector: 'mcs-create-self-managed-server',
  templateUrl: './create-self-managed-server.component.html',
  styleUrls: ['./create-self-managed-server.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateSelfManagedServerComponent implements OnInit, McsTouchedControl {

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
    return this._serverInputs.isValid;
  }

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute
  ) {
    this._serverCreateType = ServerCreateType.New;
    this._serverInputs = new ServerCreateSelfManaged();
    this._isValid = false;
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.textContent.contextualHelp;

    this._setTargetServer();
  }

  /**
   * Return true when all the forms are touched and changes are made, otherwise false
   */
  public isTouchedAndDirty(): boolean {
    let touchedDirty: boolean = false;
    if (isNullOrEmpty(this.createServerInstance)) { return; }

    // Check for dirty controls if they are marked already
    this.createServerInstance.map((instance) => {
      if (isNullOrEmpty(instance.formControls)) {
        throw new Error('Instance of the component doesnt have form');
      }
      instance.formControls.map((control) => {
        if (touchedDirty) { return; }
        touchedDirty = control.form.touched && control.form.dirty;
      });
    });
    return touchedDirty;
  }

  /**
   * This will mark all children form controls to touched
   */
  public touchedAllControls(): void {
    if (isNullOrEmpty(this.createServerInstance)) { return; }

    // Mark all controls of child component to touched;
    this.createServerInstance.map((createComponent) => {
      if (createComponent.createType === this.activeCreationTabId) {
        createComponent.touchedAllControls();
      }
    });
  }

  /**
   * Set focus on the first invalid element of the control
   */
  public setFocusToInvalidElement(): HTMLElement {
    if (isNullOrEmpty(this.createServerInstance)) { return; }

    // Mark all controls of child component to touched;
    this.createServerInstance.map((createComponent) => {
      if (createComponent.createType === this.activeCreationTabId) {
        // Set focus to the first invalid element only
        let focusFlag: boolean;
        createComponent.formControls.forEach((formControl) => {
          if (!formControl.valid && !focusFlag) {
            focusFlag = true;
            formControl.valueAccessor.focus();
          }
        });
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
  private _setTargetServer(): void {
    this.paramSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        this.targetServerId = params['clone'];
        if (this.targetServerId) {
          this._serverCreateType = ServerCreateType.Clone;
        }
      });
  }
}
