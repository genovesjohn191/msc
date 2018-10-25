import {
  async,
  TestBed
} from '@angular/core/testing';
import { ServerService } from '../server.service';
import { ServerManagementComponent } from './server-management.component';
import {
  mockServerService,
  ServersTestingModule
} from '../../testing';

describe('ServerManagementComponent', () => {
  /** Stub Services/Components */
  let component: ServerManagementComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerManagementComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(ServerService, { useValue: mockServerService });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManagementComponent, {
      set: {
        template: `
          <div>Server Management Component Template</div>
          <img #thumbnailElement/>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerManagementComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('IconKey() | Properties', () => {
    it('should get the spinner icon key definition', () => {
      expect(component).toBeDefined();
    });
  });
});
