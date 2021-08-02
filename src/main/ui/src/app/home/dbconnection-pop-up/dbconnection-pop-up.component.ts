import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from 'angular2-notifications';
import { QuoteService } from '../quote.service';

@Component({
  selector: 'app-dbconnection-pop-up',
  templateUrl: './dbconnection-pop-up.component.html',
  styleUrls: ['./dbconnection-pop-up.component.scss'],
})
export class DbconnectionPopUpComponent implements OnInit {
  @Input()
  db: string;
  imageOfDB: string;

  spinerIsActive: boolean = false;

  dbName: string;
  url: string;
  port: number;
  username: string;
  password: string;
  collection: string;
  hasAlreadyConnection: boolean;

  constructor(
    private modal: NgbModal,
    private router: Router,
    private toast: NotificationsService,
    private quoteService: QuoteService
  ) {}

  ngOnInit(): void {
    this.selectImageOfDB();
    this.hasAlreadyConnection = JSON.parse(
      localStorage.getItem('hasAlreadyConnection')
    )['conn'];
  }

  selectImageOfDB() {
    if (this.db === 'mongodb') {
      this.imageOfDB = 'assets/MongoDB-Logo.png';
    }
    if (this.db === 'neo4j') {
      this.imageOfDB = 'assets/neo4j_logo.png';
    }
    if (this.db === 'hbase') {
      this.imageOfDB = 'assets/hbase1.png';
    }
    if (this.db === 'redis') {
      this.imageOfDB = 'assets/Redis_Logo.svg';
    }
  }

  goToVisualization() {
    this.spinerIsActive = true;
    if (this.hasAlreadyConnection) {
      this.quoteService
        .disconnectFromDB(this.hasAlreadyConnection)
        .then((res) => {
          this.connectToDBs();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.connectToDBs();
    }
  }

  connectToDBs() {
    if (
      this.db === 'mongodb' ||
      this.db === 'neo4j' ||
      this.db === 'hbase' ||
      this.db === 'redis'
    ) {
      this.quoteService
        .connectToDB(
          this.db,
          this.dbName,
          this.url,
          this.port,
          this.username,
          this.password,
          this.collection
        )
        .then((res) => {
          const valueToLocalStorage = {
            conn: true,
          };
          localStorage.setItem(
            'hasAlreadyConnection',
            JSON.stringify(valueToLocalStorage)
          );

          this.spinerIsActive = false;
          this.modal.dismissAll();
          console.log(res);
          this.router.navigate(['/visualization/dbtype/' + this.db]);
        })
        .catch((err) => {
          this.toast.error('Error', 'Authentication Failure');
          this.spinerIsActive = false;
          console.log(err);
        });
    } else {
      this.toast.error('Error', 'Please choose a database first to continue.');
      this.spinerIsActive = false;
    }
  }

  close() {
    this.modal.dismissAll();
  }
}
