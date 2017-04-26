import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { ServerManagementComponent } from './server-management.component';
import {
  ActivatedRoute,
  Data
} from '@angular/router';
import { Server } from '../../';
import { TextContentProvider } from '../../../../core';

describe('ServerManagementComponent', () => {
  /** Stub Services/Components */
  let component: ServerManagementComponent;
  let mockTextContentProvider = {
    content: {
      servers: {
        server: {
          management: 'server management'
        }
      }
    }
  };
  let mockActivatedRoute = {
    parent: {
      snapshot: {
        data: {
          server: 'server details'
        }
      }
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerManagementComponent
      ],
      imports: [
      ],
      providers: [
        { provide: TextContentProvider, useValue: mockTextContentProvider },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManagementComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
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
  describe('ngOnInit()', () => {
    it('should set the value of server', () => {
      component.ngOnInit();
      expect(component.server).toBeDefined();
    });

    it('should set the value of serverManagement', () => {
      component.ngOnInit();
      expect(component.serverManagementCopyTexts).toBeDefined();
    });
  });

});
