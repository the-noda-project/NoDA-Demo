import { Component, OnInit } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { QuoteService } from './quote.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DbconnectionPopUpComponent } from './dbconnection-pop-up/dbconnection-pop-up.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  chosenDatabaseStore: string;

  activeArray: Array<any> = [];

  constructor(
    private quoteService: QuoteService,
    private router: Router,
    private modal: NgbModal,
    private toast: NotificationsService
  ) {}

  ngOnInit() {
    // Responce for noda server connection
    this.quoteService.getConnectionMessage().then((res: any) => {
      console.log(res);
    });
  }

  openModalForDBConnection() {
    if (
      this.chosenDatabaseStore === 'mongodb' ||
      this.chosenDatabaseStore === 'neo4j' ||
      this.chosenDatabaseStore === 'hbase' ||
      this.chosenDatabaseStore === 'redis'
    ) {
      const modalref = this.modal.open(DbconnectionPopUpComponent, {
        windowClass: 'modalStyle',
      });
      modalref.componentInstance.db = this.chosenDatabaseStore;
    } else {
      this.toast.error('Error', 'Please choose a database first to continue.');
    }
  }

  chooseDatabaseStore(dbName: string) {
    this.chosenDatabaseStore = dbName;
  }
}
