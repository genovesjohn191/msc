import { JsonProperty } from '@app/utilities';

export class McsOrderSimpleFirewallModifyRule {
    @JsonProperty()
    public new: string = undefined;

    @JsonProperty()
    public existing: string =undefined;
}
