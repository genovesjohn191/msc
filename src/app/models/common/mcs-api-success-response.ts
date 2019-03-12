import {
  isNullOrEmpty,
  deserializeJsonToObject
} from '@app/utilities';

export class McsApiSuccessResponse<T> {

  /**
   * Deserialize the response from API by providing its type
   * @param classType Class Type in which the response should be deserialzed
   * @param response JSON response to be converted
   */
  public static deserializeResponse<T>(
    classType: new () => any,
    response: any
  ): McsApiSuccessResponse<T> {
    if (isNullOrEmpty(response)) {
      return new McsApiSuccessResponse();
    }
    let apiResponse: McsApiSuccessResponse<any>;

    // Deserialize the MCS Api Response
    apiResponse = deserializeJsonToObject(McsApiSuccessResponse, response);
    // Deserialize the inner content
    apiResponse.content = deserializeJsonToObject(classType, apiResponse.content);
    return apiResponse;
  }

  // Memeber Fields
  public status: number;
  public totalCount: number;
  public content: T;

  constructor() {
    this.status = undefined;
    this.content = undefined;
    this.totalCount = undefined;
  }
}
