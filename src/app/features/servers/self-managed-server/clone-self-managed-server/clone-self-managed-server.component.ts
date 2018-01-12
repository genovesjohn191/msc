import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormControlDirective
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
  isNullOrEmpty,
  isFormControlValid,
  replacePlaceholder
} from '../../../../utilities';
import {
  ContextualHelpDirective,
  FormGroupDirective
} from '../../../../shared';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';

@Component({
  selector: 'mcs-clone-self-managed-server',
  templateUrl: './clone-self-managed-server.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class CloneSelfManagedServerComponent implements OnInit, AfterViewInit {
  @Input()
  public targetServer: string;

  @Input()
  public servers: Server[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChild(FormGroupDirective)
  public fgCreateDirective: FormGroupDirective;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  @ViewChildren(FormControlDirective)
  public formControls: QueryList<FormControlDirective>;

  // Form variables
  public fgCloneServer: FormGroup;
  public fcServerName: FormControl;
  public fcTargetServer: FormControl;

  // Others
  public createType: ServerCreateType;
  public textContent: any;
  public textHelpContent: any;

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
    this.createType = ServerCreateType.Clone;
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    // Set text content including contextual help
    this.textContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.textHelpContent = this.textContent.contextualHelp;

    // Register forms
    this._registerFormGroup();
    if (isNullOrEmpty(this.targetServer) && this.hasServers) {
      this.targetServer = this.servers[0].id;
    }
  }

  public ngAfterViewInit() {
    refreshView(() => {
      // Get all contextual help information
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

  public isControlValid(control: any): boolean {
    return isFormControlValid(control);
  }

  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcServerName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._customServerNameValidator.bind(this),
        this.textContent.invalidServerName
      )
    ]);

    this.fcTargetServer = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.fgCloneServer = new FormGroup({
      fcServerName: this.fcServerName,
      fcTargetServer: this.fcTargetServer
    });
    this.fgCloneServer.statusChanges.subscribe(() => {
      this._outputServerDetails();
    });
  }

  private _outputServerDetails(): void {
    let cloneSelfManaged: ServerCreateSelfManaged;
    cloneSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    cloneSelfManaged.type = ServerCreateType.Clone;
    cloneSelfManaged.serverName = this.fcServerName.value;
    cloneSelfManaged.targetServer = this.fcTargetServer.value;
    cloneSelfManaged.isValid = this.fgCloneServer.valid;
    this.onOutputServerDetails.next(cloneSelfManaged);
  }

  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }
}
