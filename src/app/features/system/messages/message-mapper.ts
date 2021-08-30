import { McsSystemMessageCreate } from '@app/models';
import { McsSystemMessageEdit } from '@app/models';
import { McsSystemMessageValidate } from '@app/models';
import { SystemMessageForm } from '@app/features-shared';

export class McsSystemMessageMapper {

  /**
   * Maps the system message data to validate
   * @param systemMessage System message form values
   * @param systemMessageId System message Id used for validation
   */
  public static mapToValidate(systemMessage: SystemMessageForm, systemMessageId?: string): McsSystemMessageValidate {
    let systemMessageValidate = new McsSystemMessageValidate();
    systemMessageValidate.expiry = systemMessage.expiry;
    systemMessageValidate.start = systemMessage.start;
    systemMessageValidate.type = systemMessage.type;
    systemMessageValidate.severity = systemMessage.severity;
    systemMessageValidate.enabled = systemMessage.enabled;
    systemMessageValidate.macquarieViewFallback = systemMessage.macquarieViewFallback;
    systemMessageValidate.id = systemMessageId || undefined;

    return systemMessageValidate;
  }

  /**
   * Maps the system message data to create
   * @param systemMessage System message form values
   */
  public static mapToCreate(systemMessage: SystemMessageForm): McsSystemMessageCreate {
    let systemMessageCreate = new McsSystemMessageCreate();
    systemMessageCreate.expiry = systemMessage.expiry;
    systemMessageCreate.start = systemMessage.start;
    systemMessageCreate.type = systemMessage.type;
    systemMessageCreate.severity = systemMessage.severity;
    systemMessageCreate.enabled = systemMessage.enabled;
    systemMessageCreate.macquarieViewFallback = systemMessage.macquarieViewFallback;
    systemMessageCreate.message = systemMessage.message;

    return systemMessageCreate;
  }

  /**
   * Maps the system message data to edit
   * @param systemMessage System message form values
   * @param systemMessageId System message Id
   */
  public static mapToEdit(systemMessage: SystemMessageForm): McsSystemMessageEdit {
    let systemMessageEdit = new McsSystemMessageEdit();
    systemMessageEdit.expiry = systemMessage.expiry;
    systemMessageEdit.start = systemMessage.start;
    systemMessageEdit.type = systemMessage.type;
    systemMessageEdit.severity = systemMessage.severity;
    systemMessageEdit.enabled = systemMessage.enabled;
    systemMessageEdit.macquarieViewFallback = systemMessage.macquarieViewFallback;

    return systemMessageEdit;
  }

}
