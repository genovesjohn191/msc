import { Overlay } from '@angular/cdk/overlay';
import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CoreTestingModule } from '@app/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { SideSheetComponent } from './sidesheet.component';
import { SideSheetModule } from './sidesheet.module';
import { SideSheetService } from './sidesheet.service';

@Component({
  selector: 'mcs-test-sidesheet',
  template: ``
})
export class SideSheetTestComponent {
  @ViewChild(SideSheetComponent)
  public sideSheetComponent: SideSheetComponent;
}

describe('SideSheetComponent', () => {

  /** Stub Services/Components */
  let fixture: ComponentFixture<SideSheetTestComponent>;
  let component: SideSheetTestComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SideSheetTestComponent
      ],
      providers: [
        TranslateService,
        SideSheetService,
        Overlay
      ],
      imports: [
        CoreTestingModule,
        SideSheetModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SideSheetTestComponent, {
      set: {
        template: `
          <mcs-sidesheet>
            <div class="test-element-class"></div>
          </mcs-sidesheet>
          `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(SideSheetTestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {

    it(`should create the mcs-sidesheet element`, () => {
      let element = document.querySelector('mcs-sidesheet');
      expect(element).not.toBe(null);
    });

    it(`should set the state to "enter"`, () => {
      expect(component.sideSheetComponent.state).toEqual("enter");
    });
  });

  describe('close()', () => {

    it(`should set state to "void" when the close button is clicked`, () => {
      const buttonElem = fixture.debugElement.query(By.css("button"));

      buttonElem.triggerEventHandler("click", null);

      expect(component.sideSheetComponent.state).toEqual("void");
    });

  });
});
