import {
  async,
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  DebugElement
} from '@angular/core';
import { By } from '@angular/platform-browser';

import { ModalDirective } from './modal.directive';
import { ModalModule } from './modal.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(ModalDirective)
  public modal: ModalDirective;
}

describe('ModalDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let directiveElement: DebugElement;
  let buttonElement: any;
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        ModalModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ModalDirective Template</div>
        <ng-template #modalContent>
          <span>Modal Content</span>
        </ng-template>

        <button class="btn btn-primary" [mcsModal]="modalContent" #modal="mcsModal">
          Modal Button
        </button><br/>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      directiveElement = fixtureInstance.debugElement.query(By.directive(ModalDirective));
      buttonElement = fixtureInstance.nativeElement.querySelector('button');
    });
  }));

  /** Test Implementation */
  describe('click() Event', () => {
    beforeEach(async(() => {
      directiveElement.triggerEventHandler('click', {});
    }));

    it(`should open/create the modal when click is triggered`, () => {
      let mcsModalExist = document.body.querySelector('mcs-modal');
      expect(mcsModalExist).not.toBe(null);
      mcsModalExist.remove();
    });
  });

  describe('onCloseModal()', () => {
    beforeEach(async(() => {
      component.modal.open();
    }));

    it(`should close the modal and modal backdrop`, fakeAsync(() => {
      component.modal.onCloseModal(null);
      tick(300);

      let mcsModalExist = document.body.querySelector('mcs-modal');
      expect(mcsModalExist).toBe(null);
    }));
  });

  describe('ngOnDestroy()', () => {
    beforeEach(async(() => {
      component.modal.open();
    }));

    it(`should close the modal and modal backdrop when component is destroyed`, fakeAsync(() => {
      component.modal.ngOnDestroy();
      tick(300);

      let mcsModalExist = document.body.querySelector('mcs-modal');
      expect(mcsModalExist).toBe(null);
    }));
  });
});
