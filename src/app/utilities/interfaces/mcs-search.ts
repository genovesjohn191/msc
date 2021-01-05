import { Subject } from 'rxjs';

export interface McsSearch {
  keyword: string;
  searchChangedStream: Subject<McsSearch>;
  searching: boolean;
  showLoading(showLoading: boolean): void;
}
