import {
  CommonDefinition,
  JsonProperty
} from "@app/utilities";

export class McsStorageSaasBackupComponentOnlineStatus {
  @JsonProperty()
  public exchange: boolean = undefined;

  @JsonProperty()
  public sharePoint: boolean = undefined;

  @JsonProperty()
  public teams: boolean = undefined;

  @JsonProperty()
  public teamsChats: boolean = undefined;

  public get exchangeStateIconKey(): string {
    return this.exchange ? CommonDefinition.ASSETS_SVG_STATE_RUNNING : 
      CommonDefinition.ASSETS_SVG_STATE_STOPPED;
  }

  public get sharePointStateIconKey(): string {
    return this.sharePoint ? CommonDefinition.ASSETS_SVG_STATE_RUNNING : 
      CommonDefinition.ASSETS_SVG_STATE_STOPPED;
  }

  public get teamsStateIconKey(): string {
    return this.teams ? CommonDefinition.ASSETS_SVG_STATE_RUNNING : 
      CommonDefinition.ASSETS_SVG_STATE_STOPPED;
  }

  public get teamsChatsStateIconKey(): string {
    return this.teamsChats ? CommonDefinition.ASSETS_SVG_STATE_RUNNING : 
      CommonDefinition.ASSETS_SVG_STATE_STOPPED;
  }
}