import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  Injector,
  ComponentFactoryResolver,
  ViewContainerRef,
  Renderer2,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsApiJob,
  McsApiTask,
  McsList,
  McsListItem,
  CoreDefinition,
  McsTextContentProvider,
  McsComponentService
} from '../../../core';
import {
  mergeArrays,
  refreshView
} from '../../../utilities';
import { ContextualHelpDirective } from '../shared/contextual-help/contextual-help.directive';
import { CreateSelfManagedServersService } from './create-self-managed-servers.service';
import {
  CreateSelfManagedServerComponent
} from './create-self-managed-server/create-self-managed-server.component';

@Component({
  selector: 'mcs-create-self-managed-servers',
  templateUrl: './create-self-managed-servers.component.html',
  styles: [require('./create-self-managed-servers.component.scss')]
})

export class CreateSelfManagedServersComponent implements OnInit, AfterViewInit {
  @ViewChild('selfManagedServersElement')
  public selfManagedServersElement: ElementRef;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives;

  public contextualTextContent: any;
  public createServerTextContent: any;
  public intellicentreValue: any;
  public intellicentres: any;
  public notifications: McsApiJob[];
  public servers: Array<McsComponentService<CreateSelfManagedServerComponent>>;
  private _mainContextInformations: ContextualHelpDirective[];

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ADD_BLACK;
  }

  public get isServersValid(): boolean {
    let inValidExists = this.servers.find((newServer) => {
      return !newServer.componentRef.instance.isValid;
    });
    return inValidExists ? false : true;
  }

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2
  ) {
    this.notifications = new Array();
    this.servers = new Array();
    this._mainContextInformations = new Array();
  }

  public ngOnInit() {
    this.createServerTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.createServerTextContent.contextualHelp;

    this.intellicentres = this.getIntellicentres();
    this.addServer();

    // TODO: Set the notifications temporarily
    this._populateNotifications();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        this._mainContextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
      }
    });
  }

  public addServer(): void {
    if (!this.selfManagedServersElement) { return; }

    // Initialize new instance of component service
    let componentService: McsComponentService<CreateSelfManagedServerComponent>;
    componentService = new McsComponentService<CreateSelfManagedServerComponent>(
      CreateSelfManagedServerComponent,
      this._componentFactoryResolver,
      this._viewContainerRef,
      this._injector,
      this._renderer
    );
    componentService.createComponent();

    // Set Component Input Parameters
    componentService.componentRef.instance.vdcName = this.intellicentreValue;
    componentService.appendComponentTo(this.selfManagedServersElement.nativeElement);

    // Add new server to servers list
    this.servers.push(componentService);
  }

  public getAllContextualInformations() {
    return mergeArrays(this._mainContextInformations,
      this._managedServerService.subContextualHelp);
  }

  public getIntellicentres(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Intellicentres',
      new McsListItem('intellicentre1', 'Intellicentre 1 (Syd) - VC 27117006'));
    itemList.push('Intellicentres',
      new McsListItem('intellicentre2', 'Intellicentre 2 (Syd) - VC 27117007'));
    itemList.push('Intellicentres',
      new McsListItem('intellicentre3', 'Intellicentre 3 (Syd) - VC 27117008'));
    return itemList;
  }

  public onNavigateToServerPage() {
    this._router.navigate(['/servers']);
  }

  // TODO: remove this method in official release
  private _populateNotifications() {
    let notification = new McsApiJob();
    // Record 1
    {
      notification.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      notification.id = '0001';
      notification.description = 'Deploying "mongo-db-prod" in Intellicentre 1 (Syd)';
      notification.tasks = new Array();
      notification.ectInSeconds = 30;
      {
        let task = new McsApiTask();
        task.id = '000A';
        task.description = 'Initializing the new Server';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000B';
        task.description = 'Preparing the server for deployment.';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000C';
        task.description = 'Deploying mongo-db-prod: 50GB, 8GB / 2vCPU';
        task.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
        notification.tasks.push(task);
      }
      this.notifications.push(notification);
    }
    // Record 2
    {
      notification = new McsApiJob();
      notification.tasks = new Array();
      notification.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      notification.id = '0002';
      notification.endedOn = new Date('2017-04-26 01:10:45');
      notification.description = 'Deploying "mongo-db-prod" in Intellicentre 2 (Syd)';
      notification.ectInSeconds = 100;
      {
        let task = new McsApiTask();
        task.id = '000A';
        task.description = 'Initializing the new Server';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000B';
        task.description = 'Deploying web-app-prod: 50GB, 8GB / 2vCPU';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      this.notifications.push(notification);
    }
  }
}
