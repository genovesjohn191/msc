import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { ServerCommandComponent } from './server-command.component';
import { McsAssetsProvider } from '../../../../core';
import { ServersService } from '../../servers.service';

describe('ServerCommandComponent', () => {
  /** Stub Services/Components */
  let component: ServerCommandComponent;
  let assetsProviderMock = {
    getIcon(iconClass: string) {
      return iconClass;
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerCommandComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: assetsProviderMock },
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerCommandComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerCommandComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should set the gear icon', () => {
      component.ngOnInit();
      expect(component.gear).toBeDefined();
    });
  });
});
