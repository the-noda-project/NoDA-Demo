import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-dbconnection-pop-up',
  templateUrl: './dbconnection-pop-up.component.html',
  styleUrls: ['./dbconnection-pop-up.component.scss'],
})
export class DbconnectionPopUpComponent implements OnInit {
  @Input()
  db: string;
  imageOfDB: string;

  constructor(
    private modal: NgbModal,
    private router: Router,
    private toast: NotificationsService
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
      this.modal.dismissAll();
      this.router.navigate(['/visualization/dbtype/' + this.db]);
    } else {
      this.toast.error('Error', 'Please choose a database first to continue.');
    }
  }

  close() {
    this.modal.dismissAll();
  }
}
