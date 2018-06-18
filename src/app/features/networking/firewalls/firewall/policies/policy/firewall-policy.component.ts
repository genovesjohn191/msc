import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FirewallPolicy } from '../../../models';
import {
  McsTextContentProvider, CoreDefinition
} from '../../../../../../core';

@Component({
  selector: 'mcs-firewall-policy',
  templateUrl: './firewall-policy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallPolicyComponent implements OnInit {
  public textContent: any;

  @Output()
  public close = new EventEmitter<void>();

  @Input()
  public get firewallPolicy(): FirewallPolicy { return this._firewallPolicy; }
  public set firewallPolicy(value: FirewallPolicy) {
    if (value !== this.firewallPolicy) {
      this._firewallPolicy = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _firewallPolicy: FirewallPolicy;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.firewalls.firewall.policies.policy;
  }

  /**
   * Returns the close icon key
   */
  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  /**
   * Closes the policy window
   */
  public closePolicy(): void {
    this.close.emit();
  }
}
