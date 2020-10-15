import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { PopoverComponent } from './popover.component';

describe('PopoverComponent', () => {

  /** Stub Services/Components */
  let component: PopoverComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        PopoverComponent
      ]
    });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(PopoverComponent, {
      set: {
        template: `
          <div>PopoverComponent Template</div>
          <div #popoverElement>Overridden template here</div>
          <div #contentElement>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(PopoverComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.ngAfterViewInit();
    });
  }));

  /** Test Implementation */
  describe('ngAfterViewInit() when theme is light', () => {
    beforeEach(waitForAsync(() => {
      component.theme = 'light';
      component.ngAfterViewInit();
    }));

    it(`should set the light class to popoverElement`, () => {
      let lightClassExist: boolean;
      lightClassExist = component.popoverElement.nativeElement
        .classList.contains('light');
      expect(lightClassExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit() when theme is dark', () => {
    beforeEach(waitForAsync(() => {
      component.theme = 'dark';
      component.ngAfterViewInit();
    }));

    it(`should set the dark class to popoverElement`, () => {
      let darkClassExist: boolean;
      darkClassExist = component.popoverElement.nativeElement
        .classList.contains('dark');
      expect(darkClassExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit() when padding is none', () => {
    beforeEach(waitForAsync(() => {
      component.padding = 'none';
      component.ngAfterViewInit();
    }));

    it(`should not set no padding to contentElement when it is set to none`, () => {
      let defaultPaddingExist: boolean;
      defaultPaddingExist = component.contentElement.nativeElement
        .classList.contains('default-padding');
      expect(defaultPaddingExist).toBeFalsy();
    });
  });

  describe('ngAfterViewInit() when padding is default', () => {
    beforeEach(waitForAsync(() => {
      component.padding = 'default';
      component.ngAfterViewInit();
    }));

    it(`should set the default-padding class to contentElement`, () => {
      let defaultPaddingExist: boolean;
      defaultPaddingExist = component.contentElement.nativeElement
        .classList.contains('default-padding');
      expect(defaultPaddingExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit() when placement is top', () => {
    beforeEach(waitForAsync(() => {
      component.placement = 'top';
      component.ngAfterViewInit();
    }));

    it(`should set the arrow-down class to popoverElement`, () => {
      let arrowDownClassExist: boolean;
      arrowDownClassExist = component.popoverElement.nativeElement.classList.contains('arrow-down');
      expect(arrowDownClassExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit() when placement is bottom', () => {
    beforeEach(waitForAsync(() => {
      component.placement = 'bottom';
      component.ngAfterViewInit();
    }));

    it(`should set the arrow-top class to popoverElement`, () => {
      let arrowTopClassExist: boolean;
      arrowTopClassExist = component.popoverElement.nativeElement.classList.contains('arrow-top');
      expect(arrowTopClassExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit() when placement is left', () => {
    beforeEach(waitForAsync(() => {
      component.placement = 'left';
      component.ngAfterViewInit();
    }));

    it(`should set the arrow-right class to popoverElement`, () => {
      let arrowRightClassExist: boolean;
      arrowRightClassExist = component.popoverElement.nativeElement
        .classList.contains('arrow-right');
      expect(arrowRightClassExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit() when placement is right', () => {
    beforeEach(waitForAsync(() => {
      component.placement = 'right';
      component.ngAfterViewInit();
    }));

    it(`should set the arrow-left class to popoverElement`, () => {
      let arrowLeftClassExist: boolean;
      arrowLeftClassExist = component.popoverElement.nativeElement
        .classList.contains('arrow-left');
      expect(arrowLeftClassExist).toBeTruthy();
    });
  });

  describe('onClickOutside()', () => {
    it(`should emit the onClickOutsideEvent property`, () => {
      spyOn(component.onClickOutsideEvent, 'emit');
      component.trigger = 'manual';
      component.onClickOutside('any');
      expect(component.onClickOutsideEvent.emit).toHaveBeenCalled();
    });
  });
});
