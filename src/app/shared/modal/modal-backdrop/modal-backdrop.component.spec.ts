import {
  async,
  TestBed
} from '@angular/core/testing';

import { ModalBackdropComponent } from './modal-backdrop.component';

describe('ModalBackdropComponent', () => {

  /** Stub Services/Components */
  let component: ModalBackdropComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ModalBackdropComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ModalBackdropComponent, {
      set: {
        template: `
          <div>ModalBackdropComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ModalBackdropComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should set the host class to modal-backdrop`, () => {
      let modalClassExist = component.classes.includes('modal');
      expect(modalClassExist).toBeTruthy();
    });

    it(`should set the host class to fade`, () => {
      let fadeClassExist = component.classes.includes('fade');
      expect(fadeClassExist).toBeTruthy();
    });

    it(`should set the host class to show`, () => {
      let showClassExist = component.classes.includes('show');
      expect(showClassExist).toBeTruthy();
    });
  });

  describe('ngAfterViewInit()', () => {
    beforeEach(async(() => {
      component.ngAfterViewInit();
    }));

    it(`should append the component to the body element`, () => {
      let mcsModalBackdropExist = document.body.getElementsByClassName('modal-backdrop');
      expect(mcsModalBackdropExist).not.toBe(null);
    });
  });

  describe('removeComponent()', () => {
    beforeEach(async(() => {
      component.removeComponent();
    }));

    it(`should append the component to the body element`, () => {
      let mcsModalBackdropExist = document.body.getElementsByClassName('modal-backdrop');
      expect(mcsModalBackdropExist.length).toBe(0);
    });
  });
});
