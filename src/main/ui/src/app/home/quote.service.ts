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
    collection?: string,
    hasAlreadyConnection?: boolean
  ) {
    const body = {
      db: db,
      dbName: dbName,
      url: url,
      port: port,
      username: username,
      password: password,
      collection: collection,
      hasAlreadyConnection: hasAlreadyConnection
    };

    return this.httpClient
      .post('/db-connection/' + body.db, body, { responseType: 'text' })
      .toPromise();
  }

  disconnectFromDB(
    hasAlreadyConnection?: boolean
  ) {
    const body = {
      hasAlreadyConnection: hasAlreadyConnection
    };

    return this.httpClient
      .post('/close-connection', body, { responseType: 'text' })
      .toPromise();
  }

}
