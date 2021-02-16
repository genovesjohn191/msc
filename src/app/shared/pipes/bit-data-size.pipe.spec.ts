import { DecimalPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { convertMbitToGbit } from '@app/utilities';
import { BitDataSizePipe } from './bit-data-size.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElementGb')
  public testElementGb: ElementRef;

  @ViewChild(BitDataSizePipe)
  public pipe: BitDataSizePipe;

  public gigabit = 1000;
}

describe('BitDataSizePipe', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        BitDataSizePipe
      ],
      providers: [DecimalPipe]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>FileSizePipe Template</div>
        <span #testElementGb>{{ gigabit | mcsBitDataSize }}</span>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should display the size in Gigabit`, () => {
      let textContentElement = component.testElementGb.nativeElement as HTMLElement;
      let sizeGb = convertMbitToGbit(component.gigabit);
      expect(textContentElement.innerText).toContain(`${sizeGb}`);
    });
  });
});