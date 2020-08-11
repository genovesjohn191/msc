import {
  async,
  TestBed
} from '@angular/core/testing';
import { CommonDefinition } from '@app/utilities';
import { HeaderComponent } from './header.component';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

describe('HeaderComponent', () => {

  /** Stub Services/Components */
  let component: HeaderComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent
      ], providers: [
        EventBusDispatcherService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(HeaderComponent, {
      set: {
        template: `<div>HeaderComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(HeaderComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the getImagePath() of AssetsProvider', () => {
      expect(component.lightLogoIconKey).toBe(CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG);
    });
  });
});
