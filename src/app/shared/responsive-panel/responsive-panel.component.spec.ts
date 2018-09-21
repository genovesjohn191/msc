import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { ResponsivePanelComponent } from './responsive-panel.component';
import { ResponsivePanelModule } from './responsive-panel.module';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-responsive-panel',
  template: ``
})
export class ResponsivePanelTestComponent {
  @ViewChild(ResponsivePanelComponent)
  public responsivePanelComponent: ResponsivePanelComponent;
}

describe('ResponsivePanelComponent', () => {

  /** Stub Services/Components */
  let component: ResponsivePanelTestComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ResponsivePanelTestComponent
      ],
      imports: [
        CoreTestingModule,
        ResponsivePanelModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ResponsivePanelTestComponent, {
      set: {
        template: `
        <mcs-responsive-panel>
          <div mcsResponsivePanelItem>
            <span>Panel Item 1</span>
          </div>
          <div mcsResponsivePanelItem>
            <span>Panel Item 2</span>
          </div>
          <div mcsResponsivePanelItem>
            <span>Panel Item 3</span>
          </div>
        </mcs-responsive-panel>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ResponsivePanelTestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.responsivePanelComponent.ngAfterViewInit();
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-responsive-panel element`, () => {
      let element = document.querySelector('mcs-responsive-panel');
      expect(element).not.toBe(null);
    });
  });
});
