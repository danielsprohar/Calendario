export class PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];

  constructor(pageIndex: number, pageSize: number, count: number, data: T[]) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.count = count;
    this.data = data;
  }
}
