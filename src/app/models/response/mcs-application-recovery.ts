import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  ApplicationRecoveryTypeText,
  ApplicationRecoveryType,
  ApplicationRecoveryTypeSerialization
} from '../enumerations/application-recovery-type.enum';
import {
  JournalHistoryText,
  JournalHistory,
  JournalHistorySerialization
} from '../enumerations/journal-history.enum';

export class McsApplicationRecovery extends McsEntityBase {

  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty({
    serializer: ApplicationRecoveryTypeSerialization,
    deserializer: ApplicationRecoveryTypeSerialization
  })
  private productType: ApplicationRecoveryType = undefined;

  @JsonProperty({
    serializer: JournalHistorySerialization,
    deserializer: JournalHistorySerialization
  })
  private journalHistory: JournalHistory = undefined;

  @JsonProperty()
  public journalSizeGB: number = undefined;

  @JsonProperty()
  public virtualMachineQuantity: number = undefined;

  /**
   * Returns the service type label
   */
  public get ApplicationRecoveryTypeLabel(): string {
    return ApplicationRecoveryTypeText[this.productType] || null;
  }

  /**
   * Returns the journal history label
   */
  public get ApplicationRecoveryJournalHistoryLabel(): string {
    return JournalHistoryText[this.journalHistory] || null;
  }
}
