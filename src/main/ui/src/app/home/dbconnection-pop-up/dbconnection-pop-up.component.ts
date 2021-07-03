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

  dbName: string;
  url: string;
  port: number;
  username: string;
  password: string;
  collection: string;

  constructor(
    private modal: NgbModal,
    private router: Router,
    private toast: NotificationsService,
    private quoteService: QuoteService
  ) {}

  ngOnInit(): void {
    this.selectImageOfDB();
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
          this.modal.dismissAll();
          console.log(res);
          this.router.navigate(['/visualization/dbtype/' + this.db]);
        })
        .catch((err) => {
          this.toast.error('Error', err);
          console.log(err);
        });
    } else {
      this.toast.error('Error', 'Please choose a database first to continue.');
    }
  }

  close() {
    this.modal.dismissAll();
  }
}
