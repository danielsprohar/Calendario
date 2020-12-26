import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResponse } from '../models/paginated-response.model';

const httpHeaders = new HttpHeaders({
  'Content-Type': 'application/json',
});

@Injectable({
  providedIn: 'root',
})
export class DataService<T> {
  constructor(private readonly http: HttpClient) {}

  /**
   * The `search` endpoint to search for resources
   * that match the given criteria provided via query parameters.
   * @param path The relative path of resource, e.g., `/events`.
   * @param params Any additional query parameters that the resource server accepts.
   */
  query(path: string, params?: HttpParams): Observable<any> {
    const url = environment.apiBaseUrl + path;
    return this.http
      .get<T | number>(url, {
        headers: httpHeaders,
        params,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches a paginated list of type `T`.
   *
   * The `offset` and `limit` clauses in the SQL query can be set
   * via the `pageIndex` and `pageSize` query parameters, respectively.
   * @param path The relative path of the resource, e.g., `/events`.
   * @param params Any additional query parameters that the resource server accepts.
   */
  getAll(path: string, params?: HttpParams): Observable<PaginatedResponse<T>> {
    const url = environment.apiBaseUrl + path;

    return this.http
      .get<PaginatedResponse<T>>(url, {
        headers: httpHeaders,
        params,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetchs a single record of type `T`.
   * @param path The relative path of the resource, e.g., `/events`.
   */
  get(path: string): Observable<T> {
    const url = environment.apiBaseUrl + path;

    return this.http
      .get<T>(url, { headers: httpHeaders })
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates a single record of type `T`.
   * @param path The relative path of the resource, e.g., `/events`.
   * @param data The updated data
   * @param params Any additional query parameters that the resource server accepts.
   */
  update(path: string, data: T | any, params?: HttpParams): Observable<T> {
    const url = environment.apiBaseUrl + path;

    return this.http
      .put<T>(url, data, { headers: httpHeaders, params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Creates a single record of type `T`.
   * @param path The relative path of the resource, e.g., `/events`.
   * @param data The data to create in the database.
   */
  create(path: string, data: T): Observable<T> {
    const url = environment.apiBaseUrl + path;

    return this.http
      .post<T>(url, data, { headers: httpHeaders })
      .pipe(catchError(this.handleError));
  }

  /**
   * Removes a single record of type `T`.
   * @param path The relative path of the resource, e.g., `/events`.
   */
  remove(path: string): Observable<T> {
    const url = environment.apiBaseUrl + path;

    return this.http
      .delete<T>(url, { headers: httpHeaders })
      .pipe(catchError(this.handleError));
  }

  // ==========================================================================

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }
}
