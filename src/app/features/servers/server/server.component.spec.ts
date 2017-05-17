import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { ServerComponent } from './server.component';
import {
  ActivatedRoute,
  Data
} from '@angular/router';
import { Server } from '../server';

describe('ServerComponent', () => {
  /** Stub Services/Components */
  let component: ServerComponent;
  let mockActivatedRoute = {
    snapshot: {
      data: {
        servers: {
          content: 'servers list'
        }
      }
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
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
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
