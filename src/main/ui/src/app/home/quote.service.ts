import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  dataFromServer: string;

  constructor(private httpClient: HttpClient) {}

  updateData(data: string) {
    this.dataFromServer = data;
  }

  getData() {
    return this.dataFromServer;
  }

  getConnectionMessage() {
    return this.httpClient
      .get('/connection-message', { responseType: 'text' })
      .toPromise();
  }

  connectToDB(
    db?: string,
    dbName?: string,
    url?: string,
    port?: number,
    username?: string,
    password?: string,
    collection?: string
  ) {
    const body = {
      db: db,
      dbName: dbName,
      url: url,
      port: port,
      username: username,
      password: password,
      collection: collection
    };

    return this.httpClient
      .post('/db-connection/' + body.db, body, { responseType: 'text' })
      .toPromise();
  }

  // getNodaSTData() {
  //   return this.httpClient
  //     .get('/noda-st-timelapse', { responseType: 'text' })
  //     .toPromise();
  // }

  // getNodaSpatialData() {
  //   return this.httpClient
  //     .get('/noda-spatial', { responseType: 'text' })
  //     .toPromise();
  // }
}
