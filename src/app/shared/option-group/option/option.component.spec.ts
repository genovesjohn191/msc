import {
  ComponentFixture,
  TestBed,
  waitForAsync
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CoreTestingModule } from "@app/core/testing/core-testing.module";
import { CheckboxModule } from "@app/shared/checkbox/checkbox.module";
import { ItemModule } from "@app/shared/item/item.module";
import { RippleModule } from "@app/shared/ripple/ripple.module";
import { OptionComponent } from "./option.component";

describe("OptionComponent", () => {

  /** Stub Services/Components */
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;

  beforeEach(waitForAsync(() => {

    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        OptionComponent
      ],
      imports: [
        CoreTestingModule,
        RippleModule,
        ItemModule,
        CheckboxModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(OptionComponent);

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-option element`, () => {
      expect(component).toBeTruthy();
    });

  });

  describe("selectionChange", () => {

    it(`should trigger selectionChange`, () => {
      component.selected = false;
      fixture.detectChanges();
      const spy = spyOn(component.selectionChange, "emit");

      component.selected = true;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it(`should not trigger selectionChange if values are same`, () => {
      component.selected = true;
      fixture.detectChanges();
      const spy = spyOn(component.selectionChange, "emit");

      component.selected = true;

      expect(spy).toHaveBeenCalledTimes(0);
    });
  })

  describe("activeChange", () => {

    it(`should trigger activeChange`, () => {
      component.active = false;
      fixture.detectChanges();
      const spy = spyOn(component.activeChange, "emit");

      component.active = true;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it(`should not trigger activeChange if values are same`, () => {
      component.active = true;
      fixture.detectChanges();
      const spy = spyOn(component.activeChange, "emit");

      component.active = true;

      expect(spy).toHaveBeenCalledTimes(0);
    });
  })

  describe('showCheckbox()', () => {
    it(`should contain mcs-checkbox`, () => {
      component.showCheckbox();
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.queryAll(By.css("mcs-checkbox"));

      expect(checkboxElement.length).toBe(1);
    });

    it(`should not contain mcs-checkbox by default`, () => {
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.queryAll(By.css("mcs-checkbox"));

      expect(checkboxElement.length).toBe(0);
    });
  });

  describe('hideCheckbox()', () => {
    it(`should not contain mcs-checkbox if the method is called`, () => {
      component.hideCheckbox();
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.queryAll(By.css("mcs-checkbox"));

      expect(checkboxElement.length).toBe(0);
    });

  });

  describe("onClickOption()", () => {

    it(`should trigger clickChange when onClickOption() is called`, () => {
      const spy = spyOn(component.clickChange, "next");
      fixture.detectChanges();

      component.onClickOption();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it(`should not trigger clickChange when it is disabled`, () => {
      const spy = spyOn(component.clickChange, "next");
      component.disabled = true;
      fixture.detectChanges();

      component.onClickOption();

      expect(spy).toHaveBeenCalledTimes(0);
    });
  })

  describe("visibilityChange", () => {

    it(`should trigger visibilityChange when show() is called`, () => {
      const spy = spyOn(component.visibilityChange, "next");
      fixture.detectChanges();

      component.show();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it(`should trigger visibilityChange when hide() is called`, () => {
      const spy = spyOn(component.visibilityChange, "next");
      fixture.detectChanges();

      component.hide();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it(`should not trigger clickChange when it is disabled`, () => {
      const spy = spyOn(component.clickChange, "next");
      component.disabled = true;
      fixture.detectChanges();

      component.onClickOption();

      expect(spy).toHaveBeenCalledTimes(0);
    });
  })
})