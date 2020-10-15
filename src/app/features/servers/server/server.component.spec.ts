import { EventEmitter } from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { ServerService } from '../server/server.service';
import {
  mockServerService,
  ServersTestingModule
} from '../testing';
import { ServerComponent } from './server.component';

describe('ServerComponent', () => {
  /** Stub Services/Components */
  let component: ServerComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerComponent, {
      set: {
        template: `
          <div>Server Component Template</div>
        `
      }
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(ServerService, { useValue: mockServerService });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.search = {
        keyword: '',
        searchChangedStream: new EventEmitter(),
        searching: false,
        showLoading() { return true; }
      };
    });
  }));

});
