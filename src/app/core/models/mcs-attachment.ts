import { FileLikeObject } from 'ng2-file-upload';

export class McsAttachment {
  public filename: string;
  public fileContents: FileLikeObject;
  public base64Contents: string;
}
