import {
    Component,
    ViewChild
} from "@angular/core";
import {
    ComponentFixture,
    TestBed,
    waitForAsync
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CoreTestingModule } from "@app/core/testing";
import { OptionGroupComponent } from "./option-group.component";
import { OptionGroupModule } from "./option-group.module";
import { OptionComponent } from "./option/option.component";

@Component({
    selector: 'mcs-test-option-group',
    template: ``
})
export class TestOptionGroupComponent {
    @ViewChild(OptionGroupComponent)
    public optionGroupComponent: OptionGroupComponent;

    constructor() {
    }
}

describe("OptionGroupComponent", () => {
    let component: TestOptionGroupComponent;
    let fixture: ComponentFixture<TestOptionGroupComponent>;

    /** Stub Services/Components */

    beforeEach(waitForAsync(() => {
        /** Testbed Reset Module */
        TestBed.resetTestingModule();

        /** Testbed Configuration */
        TestBed.configureTestingModule({
            declarations: [
                TestOptionGroupComponent
            ],
            imports: [
                OptionGroupModule,
                CoreTestingModule
            ]
        });

        /** Testbed Onverriding of Components */
        TestBed.overrideComponent(TestOptionGroupComponent, {
            set: {
                template: `
                <mcs-option-group>
                    <ng-container *mcsOptionGroupHeader>
                        <span>Group Header</span>
                    </ng-container>
                    <mcs-option>Option 1</mcs-option>
                    <mcs-option>Option 2</mcs-option>
                    <mcs-option>Option 3</mcs-option>
                </mcs-option-group>`
            }
        });

        /** Tesbed Component Compilation and Creation */
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TestOptionGroupComponent);
            fixture.detectChanges();
            component = fixture.componentInstance;
        });
    }));

    /** Test Implementation */
    describe('ngOnInit()', () => {
        it(`should create the mcs-option-group element`, () => {
            let optionGroupElement = document.querySelector('mcs-option-group');
            expect(optionGroupElement).not.toBe(null);
        });
    });

    describe("ngAfterContentInit()", () => {
        it(`should create 3 mcs-option elements`, () => {
            let optionElement = document.querySelectorAll('mcs-option');

            expect(optionElement.length).toBe(3);
        });

        it(`should close the panel if no header template`, () => {

            expect(component.optionGroupComponent.panelOpen).toBeTrue();
        });
    })

    describe("hasSelectedOption()", () => {

        it(`should return true when at least 1 option is selected`, () => {
            let optionElements = fixture.debugElement.queryAll(By.directive(OptionComponent));

            (<OptionComponent>optionElements[0].componentInstance).select();

            expect(component.optionGroupComponent.hasSelectedOption).toBeTrue();
        });

        it(`should return false when no option is selected`, () => {

            expect(component.optionGroupComponent.hasSelectedOption).toBeFalse();
        });
    })

    describe("hasOptions()", () => {

        it(`should return true by default`, () => {

            expect(component.optionGroupComponent.hasOptions).toBeTrue();
        });

        it(`should return true when at least 1 option is visible`, () => {
            let optionElements = fixture.debugElement.queryAll(By.directive(OptionComponent));

            (<OptionComponent>optionElements[0].componentInstance).hide();
            (<OptionComponent>optionElements[1].componentInstance).hide();

            expect(component.optionGroupComponent.hasOptions).toBeTrue();
        });

        it(`should return false when no option is visible`, () => {
            let optionElements = fixture.debugElement.queryAll(By.directive(OptionComponent));

            optionElements.forEach(elem => (<OptionComponent>elem.componentInstance).hide())

            expect(component.optionGroupComponent.hasSelectedOption).toBeFalse();
        });
    })
})