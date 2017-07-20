import {
  async,
  TestBed
} from '@angular/core/testing';

import { PopoverComponent } from './popover.component';

describe('PopoverComponent', () => {

  /** Stub Services/Components */
  let component: PopoverComponent;

  beforeEach(async(() => {
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
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() when theme is light', () => {
    beforeEach(async(() => {
      component.theme = 'light';
      component.ngOnInit();
    }));

    it(`should set the light class to popoverElement`, () => {
      let lightClassExist: boolean;
      lightClassExist = component.popoverElement.nativeElement
        .classList.contains('light');
      expect(lightClassExist).toBeTruthy();
    });
  });

  describe('ngOnInit() when theme is dark', () => {
    beforeEach(async(() => {
      component.theme = 'dark';
      component.ngOnInit();
    }));

    it(`should set the dark class to popoverElement`, () => {
      let darkClassExist: boolean;
      darkClassExist = component.popoverElement.nativeElement
        .classList.contains('dark');
      expect(darkClassExist).toBeTruthy();
    });
  });

  describe('ngOnInit() when padding is none', () => {
    beforeEach(async(() => {
      component.padding = 'none';
      component.ngOnInit();
    }));

    it(`should not set any padding class to contentElement`, () => {
      let defaultPaddingExist: boolean;
      defaultPaddingExist = component.contentElement.nativeElement
        .classList.contains('default-padding');
      expect(defaultPaddingExist).toBeFalsy();
    });
  });

  describe('ngOnInit() when padding is default', () => {
    beforeEach(async(() => {
      component.padding = 'default';
      component.ngOnInit();
    }));

    it(`should set the default-padding class to contentElement`, () => {
      let defaultPaddingExist: boolean;
      defaultPaddingExist = component.contentElement.nativeElement
        .classList.contains('default-padding');
      expect(defaultPaddingExist).toBeTruthy();
    });
  });

  describe('ngOnInit() when placement is top', () => {
    beforeEach(async(() => {
      component.placement = 'top';
      component.ngOnInit();
    }));

    it(`should set the popoverElement flex-direction to column-reverse`, () => {
      expect(component.popoverElement.nativeElement.style.flexDirection).toBe('column-reverse');
    });

    it(`should set the arrow-down class to popoverElement`, () => {
      let arrowDownClassExist: boolean;
      arrowDownClassExist = component.popoverElement.nativeElement.classList.contains('arrow-down');
      expect(arrowDownClassExist).toBeTruthy();
    });
  });

  describe('ngOnInit() when placement is bottom', () => {
    beforeEach(async(() => {
      component.placement = 'bottom';
      component.ngOnInit();
    }));

    it(`should set the popoverElement flex-direction to column`, () => {
      expect(component.popoverElement.nativeElement.style.flexDirection).toBe('column');
    });

    it(`should set the arrow-top class to popoverElement`, () => {
      let arrowTopClassExist: boolean;
      arrowTopClassExist = component.popoverElement.nativeElement.classList.contains('arrow-top');
      expect(arrowTopClassExist).toBeTruthy();
    });
  });

  describe('ngOnInit() when placement is left', () => {
    beforeEach(async(() => {
      component.placement = 'left';
      component.ngOnInit();
    }));

    it(`should set the popoverElement flex-direction to row-reverse`, () => {
      expect(component.popoverElement.nativeElement.style.flexDirection).toBe('row-reverse');
    });

    it(`should set the arrow-right class to popoverElement`, () => {
      let arrowRightClassExist: boolean;
      arrowRightClassExist = component.popoverElement.nativeElement
        .classList.contains('arrow-right');
      expect(arrowRightClassExist).toBeTruthy();
    });
  });

  describe('ngOnInit() when placement is right', () => {
    beforeEach(async(() => {
      component.placement = 'right';
      component.ngOnInit();
    }));

    it(`should set the popoverElement flex-direction to row`, () => {
      expect(component.popoverElement.nativeElement.style.flexDirection).toBe('row');
    });

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
