export class McsApiSuccessResponse<T> {
  public status: number;
  public content: T;
  public totalCount: number;
}
