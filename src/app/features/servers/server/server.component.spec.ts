import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { ServerComponent } from './server.component';
import {
  Router,
  ActivatedRoute,
  Data
} from '@angular/router';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { Server } from '../models';
import { ServersService } from '../servers.service';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../core';

describe('ServerComponent', () => {
  /** Stub Services/Components */
  let component: ServerComponent;
  let mockActivatedRoute = {
    snapshot: {
      data: {
        servers: {
          content: 'servers list'
        },
        server: {
          content: 'server details'
        }
      }
    }
  };
  let textContentProviderMock = {
    content: {
      servers: {
        server: 'Server Details'
      }
    }
  };
  let mockRouterService = {
    navigate(): any { return null; },
    events: Observable.of(new Event('event'))
  };
  let serversServiceMock = {
    activeServersStream: new Subject<any>(),
    postServerCommand(id: any, action: string) {
      return true;
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerComponent
      ],
      imports: [
      ],
      providers: [
        { provide: Router, useValue: mockRouterService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ServersService, useValue: serversServiceMock },
        { provide: McsTextContentProvider, useValue: textContentProviderMock }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should get the servers from activated route snapshot data', () => {
      component.ngOnInit();
      expect(component.servers).toBeDefined();
    });
  });

});
