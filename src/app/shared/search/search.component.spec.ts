import {
  async,
  TestBed,
  tick,
  fakeAsync
} from '@angular/core/testing';
import { CommonDefinition } from '@app/utilities';
import { CoreTestingModule } from '@app/core/testing';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {

  /** Stub Services/Components */
  let component: SearchComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SearchComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SearchComponent, {
      set: {
        template: `
          <div>SearchComponent Template</div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SearchComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('onChangeKeyEvent()', () => {
    it(`should set the keyword to "A".`, fakeAsync(() => {
      component.onChangeKeyEvent('A');
      tick(CommonDefinition.SEARCH_TIME as number);
      expect(component.keyword).toBe('A');
    }));
  });

  describe('onEnterKeyUpEvent()', () => {
    it(`should set the keyword to "B".`, fakeAsync(() => {
      component.onEnterKeyUpEvent('B');
      tick(CommonDefinition.SEARCH_TIME as number);
      expect(component.keyword).toBe('B');
    }));
  });
});
