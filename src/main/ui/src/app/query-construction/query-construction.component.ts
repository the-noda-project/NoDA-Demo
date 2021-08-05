import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { themeFromMapBox } from '../shell/shell.service';
import * as L from 'leaflet';
import { Options } from 'ng5-slider';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryConstructionService } from './query-construction.service';
import { QuoteService } from '@app/home/quote.service';
import * as turf from '@turf/turf';
import { DbconnectionPopUpComponent } from '@app/home/dbconnection-pop-up/dbconnection-pop-up.component';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-query-construction',
  templateUrl: './query-construction.component.html',
  styleUrls: ['./query-construction.component.scss'],
})
export class QueryConstructionComponent implements OnInit {
  query: string;
  NoSQLExpression: string = 'Not available yet.';

  // queryToRunMongo: string =
  //   'SELECT* FROM car WHERE GEO_RECTANGLE(location, [(13.263160139322283, 52.49997397893388),(13.306762129068376, 52.52113031608697)] )';
  // queryToRunNeo4j: string =
  //   "SELECT* FROM car WHERE GEO_TEMPORAL_CIRCLE_KM(location, (13.285476118326189, 52.51026611136366), 1.5, date, '29/05/2007 12:00:00', '1/06/2007 12:00:00')";
  // queryToRunHbase: string =
  //   'SELECT* FROM car WHERE GEO_CIRCLE_KM(location, (13.272429853677751, 52.509430292042886), 1)';
  // queryToRunRedis: string =
  //   'SELECT* FROM car WHERE GEO_CIRCLE_KM(location, (13.272429853677751, 52.509430292042886), 1)';

  // mongoSQLQuery: string =
  //   'SELECT* FROM car WHERE GEO_RECTANGLE(location, [(13.263160139322283, 52.49997397893388),(13.306762129068376, 52.52113031608697)] )';
  // neo4jSQLQuery: string =
  //   "SELECT* FROM car WHERE GEO_TEMPORAL_CIRCLE_KM(location, (13.285476118326189, 52.51026611136366), 1.5, Timestamp, '29/05/2007 12:00:00', '1/06/2007 12:00:00')";
  // hbaseSQLQuery: string =
  //   'SELECT* FROM car WHERE GEO_CIRCLE_KM(location, (13.272429853677751, 52.509430292042886), 1)';
  // redisSQLQuery: string =
  //   'SELECT* FROM car WHERE GEO_CIRCLE_KM(location, (13.272429853677751, 52.509430292042886), 1)';

  // mongoActualQuery: string =
  //   "{'$match': {'$and': [{'location': {'$geoWithin': {'$geometry': {'type': 'Polygon', 'coordinates': [[[13.263160139322283, 52.49997397893388], [13.263160139322283, 52.52113031608697], [13.306762129068376, 52.52113031608697], [13.306762129068376, 52.49997397893388], [13.263160139322283, 52.49997397893388]]]}}}}, {'$or': [{'hilIndex': {'$in': [37893268]}}]}]}}, {'$limit': 10000}, {'$sample': {'size': 1000}}";
  // neo4jActualQuery: string =
  //   "'MATCH (s:car) WHERE s.STHilbertIndex = 8651829 WITH s WHERE distance(point({ srid :7203, x: 52.51026611136366 , y: 13.285476118326189 }), s.location) < 1.5 AND 1180429200000 < s.Timestamp < 1180483200000 WITH s RETURN *'";
  // hbaseActualQuery: string =
  //   'FilterList AND (2/2): [FilterList AND (2/2): [PrefixFilter u336w, CircleFilter (location, longitude, latitude, (13.272429853677751 52.509430292042886),1)], FilterList OR (0/0): []]';
  // redisActualQuery: string =
  //   'FilterList AND (2/2): [FilterList AND (2/2): [PrefixFilter u336w, CircleFilter (location, longitude, latitude, (13.272429853677751 52.509430292042886),1)], FilterList OR (0/0): []]';

  selectValue: string = 'default';
  fromValue: string = 'default';
  whereValue: string = 'default';

  objectIdFieldName: string;
  objectLocationFieldName: string;
  objectTimeFieldName: string;
  minTimestamp: string;
  maxTimestamp: string;

  radius?: number;
  lat?: number;
  lon?: number;
  lat1?: number;
  lon1?: number;

  isLoading: boolean = false;

  constructor(
    private modal: NgbModal,
    private quoteService: QuoteService,
    private queryConstructionServ: QueryConstructionService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private toast: NotificationsService
  ) {}

  chosenGeoSQLFunction: string = 'default';

  activeDatabase: string;

  changeFloor: boolean;
  changeCeil: boolean;
  fps: number;
  addTime: number;
  windowBetweenFloorAndCeil: number;
  dbChangeConnectorLoading = false;

  dataFromServer: string;
  data: Array<any> = [];
  groupedData: any;
  idArray: Array<any> = [];

  opt: Options = {
    floor: 0,
    ceil: 10,
  };

  activeArray: Array<any> = [];

  value: number = 5;
  maxValue: number = 8;

  isDropDownOpen: boolean = false;
  isQueryConstructorTabOpen: boolean = true;
  isSQLqueryTabOpen: boolean = true;
  isActualDBTabOpen: boolean = true;

  drawItems: L.FeatureGroup = L.featureGroup();

  drawOptions = {
    edit: {
      featureGroup: this.drawItems,
    },
    position: 'topleft',
    draw: {
      marker: false,
      circle: {
        shapeOptions: {
          fillOpacity: 0.08,
        },
      },
      rectangle: {
        showArea: false,
        shapeOptions: {
          fillOpacity: 0.08,
        },
      }, // disable showArea
      polyline: false,
      polygon: false,
      circlemarker: false,
    },
  };

  dropDownProps = {
    mongo: ['vehicle', 'car_type', 'hilIndex', 'location', 'date'],
    neo4j: ['vehicle', 'location', 'hilIndex', 'stHilIndex', 'date'],
    hbase: ['location'],
    hbaseID: [
      'location:vehicle',
      'location:date',
      'location:latitude',
      'location:longitude',
    ],
    redis: ['vehicle', 'date', 'location'],
    redisID: ['vehicle', 'date', 'longitude', 'latitude'],
  };

  map: L.Map;
  layers: Array<any> = [];
  options = {
    layers: [L.tileLayer(themeFromMapBox, { maxZoom: 25, attribution: '...' })],
    zoom: 8,
    center: L.latLng(38.3159583, 22.6079104),
  };

  ngOnInit(): void {
    this.isDropDownOpen = false;
    this.dbChangeConnectorLoading = true;
    this.fps = 0.2;
    this.windowBetweenFloorAndCeil = 3;
    this.changeFloor = false;
    this.changeCeil = false;
    this.query = null;

    this.activeRoute.paramMap.subscribe((params: any) => {
      this.activeDatabase = params.get('dbType');
    });

    setTimeout(() => {
      this.dbChangeConnectorLoading = false;
    }, 1500);
  }

  openCloseQueryConstructorTab() {
    this.isQueryConstructorTabOpen = !this.isQueryConstructorTabOpen;
  }

  openCloseSQLQueryTab() {
    this.isSQLqueryTabOpen = !this.isSQLqueryTabOpen;
  }

  openCloseActualDBTab() {
    this.isActualDBTabOpen = !this.isActualDBTabOpen;
  }

  openModalForDBConnection(db: string) {
    if (
      db === 'mongodb' ||
      db === 'neo4j' ||
      db === 'hbase' ||
      db === 'redis'
    ) {
      const modalref = this.modal.open(DbconnectionPopUpComponent, {
        windowClass: 'modalStyle',
      });
      modalref.componentInstance.db = db;
    } else {
      this.toast.error('Error', 'Please choose a database first to continue.');
    }
  }

  changeStateOfDropDown() {
    this.isDropDownOpen = !this.isDropDownOpen;
  }

  onDrawCreated(e: any) {
    this.drawItems.addLayer((e as L.DrawEvents.Created).layer);
  }

  onMapReady(map: L.Map) {
    this.map = map;

    map.on(L.Draw.Event.CREATED, (e) => {
      this.drawLogic(e);
    });
  }

  leafletDrawDeleted(e: any) {
    this.layers = [];
  }

  drawLogic(e: any) {
    const type = (e as any).layerType,
      layer = (e as any).layer;

    if (type === 'circle') {
      var theCenterPt = layer.getLatLng();
      var center = [theCenterPt.lng, theCenterPt.lat];
      console.log(center);

      var theRadius = layer.getRadius();

      console.log('radius: ', theRadius, 'Center: ', theCenterPt.lat);
      this.radius = theRadius / 1000;
      this.lat = theCenterPt.lat;
      this.lon = theCenterPt.lng;
    }

    if (type === 'rectangle') {
      var rectanglePoints = layer.getLatLngs();
      console.log(rectanglePoints);
      this.lat = rectanglePoints[0][0].lat;
      this.lon = rectanglePoints[0][0].lng;
      this.lat1 = rectanglePoints[0][3].lat;
      this.lon1 = rectanglePoints[0][3].lng;
    }
  }

  runSpatialQuery() {
    this.layers = [];
    if (this.objectIdFieldName) {
      if (this.objectLocationFieldName) {
        if (this.lat && this.lon) {
          this.isLoading = true;

          if (this.chosenGeoSQLFunction === 'GEO_CIRCLE_KM') {
            //'SELECT* FROM car WHERE GEO_CIRCLE_KM(location, (13.272429853677751, 52.509430292042886), 1)';
            this.query =
              'SELECT * FROM ' +
              this.fromValue +
              ' WHERE ' +
              this.chosenGeoSQLFunction +
              '(' +
              this.objectLocationFieldName +
              ', ( ' +
              this.lon +
              ', ' +
              this.lat +
              ' ), ' +
              this.radius +
              ' )';
            console.log(this.query);
          } else {
            //'SELECT* FROM car WHERE GEO_RECTANGLE(location, [(13.263160139322283, 52.49997397893388),(13.306762129068376, 52.52113031608697)] )';
            this.query =
              'SELECT * FROM ' +
              this.fromValue +
              ' WHERE ' +
              this.chosenGeoSQLFunction +
              '( ' +
              this.objectLocationFieldName +
              ' ,[( ' +
              this.lon +
              ', ' +
              this.lat +
              ' ), ( ' +
              this.lon1 +
              ' , ' +
              this.lat1 +
              ' )])';
            console.log(this.query);
          }

          this.queryConstructionServ
            .spatialSqlQueryPost(
              this.query,
              this.objectIdFieldName,
              this.objectLocationFieldName
            )
            .then((res) => {
              this.query = this.query;

              console.log(res);
              const data = JSON.parse(res);
              if (data['status'] === 'ok') {
                this.isLoading = false;
                this.NoSQLExpression = data['exp'];

                this.quoteService.updateData(res);
                // Take data from serve from quoteService
                this.dataFromServer = this.quoteService.getData();

                console.log(
                  'edwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwww',
                  this.dataFromServer
                );

                let parsedData = JSON.parse(this.dataFromServer);
                this.data = parsedData['data'];

                this.groupedData = this.data;
                console.log(
                  'auta einai ta grouparismena data',
                  this.groupedData
                );
                if (this.groupedData[0].id) {
                  let o = Math.round;
                  let r = Math.random;
                  let s = 255;
                  this.data.forEach((element) => {
                    let index = this.idArray.findIndex(
                      (id) => id.id === element.id
                    );

                    if (index === -1) {
                      this.idArray.push({
                        id: element.id,
                        color:
                          'rgb(' +
                          o(r() * s) +
                          ',' +
                          o(r() * s) +
                          ',' +
                          o(r() * s) +
                          ')',
                      });
                    }
                  });

                  // this.createActiveArray()

                  console.log(' auto einai to id array: ', this.idArray);

                  this.spatialVisualization();
                } else {
                  this.toast.error('Error', 'Something went bad!');
                }
              }
            })
            .catch((err) => {
              this.isLoading = false;
              console.log(err);
            });
        } else {
          this.toast.error('You have to draw on map the limits of the query!');
        }
      } else {
        this.toast.error('Location field must have a value!');
      }
    } else {
      this.toast.error('ID field must have a value!');
    }
  }

  runSpatioTemporalQuery() {
    this.layers = [];
    if (this.objectIdFieldName) {
      if (this.objectLocationFieldName) {
        if (
          this.objectTimeFieldName &&
          this.minTimestamp &&
          this.maxTimestamp
        ) {
          if (this.lat && this.lon) {
            if (this.chosenGeoSQLFunction === 'GEO_TEMPORAL_CIRCLE_KM') {
              // "SELECT * FROM car WHERE GEO_TEMPORAL_CIRCLE_KM(location, (13.285476118326189, 52.51026611136366), 1.5, date, '29/05/2007 12:00:00', '1/06/2007 12:00:00')";
              this.query =
                'SELECT * FROM ' +
                this.fromValue +
                ' WHERE ' +
                this.chosenGeoSQLFunction +
                '( ' +
                this.objectLocationFieldName +
                ' , ( ' +
                this.lon +
                ' ,' +
                this.lat +
                ' ), ' +
                this.radius +
                ' , ' +
                this.objectTimeFieldName +
                " , '" +
                this.minTimestamp +
                "' , '" +
                this.maxTimestamp +
                "' )";
              console.log(this.query);
            } else {
              this.query =
                'SELECT * FROM ' +
                this.fromValue +
                ' WHERE ' +
                this.chosenGeoSQLFunction +
                '( ' +
                this.objectLocationFieldName +
                ' ,[( ' +
                this.lon +
                ' , ' +
                this.lat +
                ' ) ,( ' +
                this.lon1 +
                ' , ' +
                this.lat1 +
                ' )], ' +
                this.objectTimeFieldName +
                " , '" +
                this.minTimestamp +
                "' , '" +
                this.maxTimestamp +
                "' )";
              console.log(this.query);
            }

            this.isLoading = true;
            this.queryConstructionServ
              .spatioTemporalSqlQueryPost(
                this.query,
                this.objectIdFieldName,
                this.objectLocationFieldName,
                this.objectTimeFieldName
              )
              .then((res) => {
                console.log(res);
                const data = JSON.parse(res);
                if (data['status'] === 'ok') {
                  this.isLoading = false;
                  this.query = this.query;
                  this.NoSQLExpression = data['exp'];
                  this.quoteService.updateData(res);
                  // Take data from serve from quoteService
                  this.dataFromServer = this.quoteService.getData();

                  console.log(
                    'edwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwwwedwwwwwwwwwwwwwwwwwww',
                    this.dataFromServer
                  );
                  let parsedData = JSON.parse(this.dataFromServer);
                  this.data = parsedData['data'];

                  // JS Date needs milli Epoch Timestamp (so below is a milli epoch converter)
                  console.log(
                    this.data,
                    'ayto einai ena date: ' +
                      new Date(
                        parseInt(
                          this.timestampManipulation(this.data[0]['time'])
                        )
                      )
                  );

                  this.opt = {
                    floor: parseInt(
                      this.timestampManipulation(this.data[0]['time'])
                    ),
                    ceil: parseInt(
                      this.timestampManipulation(
                        this.data[this.data.length - 1]['time']
                      )
                    ),
                  };

                  console.log('floor', this.opt.floor, 'ceil', this.opt.ceil);

                  this.value = this.opt.floor;
                  this.maxValue =
                    this.opt.floor +
                    this.windowBetweenFloorAndCeil * 60 * 60 * 1000;

                  this.groupedData = _.groupBy(this.data, 'time');
                  console.log(
                    'auta einai ta grouparismena data',
                    this.groupedData
                  );

                  // for (let key in this.groupedData) {
                  //   this.opt.ticksArray.push(parseInt(this.timestampManipulation(key)));
                  // }

                  // console.log('ticksArray: ', this.opt.ticksArray);

                  let o = Math.round;
                  let r = Math.random;
                  let s = 255;
                  this.data.forEach((element) => {
                    let index = this.idArray.findIndex(
                      (id) => id.id === element.id
                    );

                    if (index === -1) {
                      this.idArray.push({
                        id: element.id,
                        color:
                          'rgb(' +
                          o(r() * s) +
                          ',' +
                          o(r() * s) +
                          ',' +
                          o(r() * s) +
                          ')',
                      });
                    }
                  });

                  // this.createActiveArray()

                  console.log(' auto einai to id array: ', this.idArray);
                  this.playSpatioTemporal();
                } else {
                  this.toast.error('Error', 'Something went bad!');
                }
              })
              .catch((err) => {
                this.isLoading = false;
                console.log(err);
              });
          } else {
            this.toast.error(
              'You have to draw on map the limits of the query!'
            );
          }
        } else {
          this.toast.error(
            'Time field must have a value and mix/max timestamp also!'
          );
        }
      } else {
        this.toast.error('Location field must have a value!');
      }
    } else {
      this.toast.error('ID field must have a value!');
    }
  }

  timestampManipulation(time: any) {
    let manipulatedTime;

    if (time.length === 13) {
      manipulatedTime = time;
    }
    if (time.length < 13) {
      manipulatedTime = parseInt((time += '000'));
    }
    if (time.length > 13) {
      manipulatedTime = new Date(time).getTime();
    }

    return manipulatedTime;
  }

  changeFloorOrCeil(type: string) {
    if (type === 'floor') {
      this.changeFloor = !this.changeFloor;
      console.log(this.opt.floor);
    }
    if (type === 'ceil') {
      this.changeCeil = !this.changeCeil;
      console.log(this.opt.ceil);
    }
  }

  getRGBofPin(id: string) {
    const index = this.idArray.findIndex((el) => el.id === id);
    return this.idArray[index].color;
  }

  spatialVisualization() {
    const myRenderer = L.canvas({
      padding: 0.01,
    });

    this.groupedData.forEach((position: any) => {
      const lat = position.lat;
      const lon = position.lon;
      if (position.id) {
        let myIcon = L.divIcon({
          html:
            '<div style="background-color: ' +
            this.getRGBofPin(position.id) +
            ' ; height: 10px; width: 10px; border-radius: 100%;"></div>',
        });

        this.layers.push(
          L.circleMarker([lat, lon], {
            renderer: myRenderer,
            color: this.getRGBofPin(position.id),
            fillColor: this.getRGBofPin(position.id),
            fill: true,
            weight: 0.2,
            stroke: false,
            fillOpacity: 1,
          })
        );
      } else {
        let myIcon = L.divIcon({
          html:
            '<div style="background-color: green; height: 10px; width: 10px; border-radius: 100%;"></div>',
        });

        this.layers.push(
          L.circleMarker([lat, lon], {
            renderer: myRenderer,
            color: '#228B22',
            fillColor: '#228B22',
            fill: true,
            weight: 0.2,
            stroke: false,
            fillOpacity: 1,
          })
        );

        this.layers.push(
          L.circleMarker([lat, lon], {
            renderer: myRenderer,
            color: '#228B22',
            fillColor: '#228B22',
            fill: true,
            weight: 0.2,
            stroke: false,
            fillOpacity: 1,
          })
        );
      }
    });
  }

  playSpatioTemporal() {
    // this.value = this.opt.floor;
    this.layers = [];

    this.maxValue =
      this.opt.floor + this.windowBetweenFloorAndCeil * 60 * 60 * 1000;
    let i = 0;

    // for (let key in this.groupedData) {
    for (let key in this.groupedData) {
      console.log('eimai akrivos apekso!');

      i++;

      setTimeout(() => {
        if (parseInt(this.timestampManipulation(key)) > this.opt.floor) {
          this.groupedData[key].forEach((element: any) => {
            const lat = element.lat;
            const lon = element.lon;
            const time = element.time;
            let myIcon = L.divIcon({
              html:
                '<div style="background-color: ' +
                this.getRGBofPin(element.id) +
                ' ; height: 10px; width: 10px; border-radius: 100%;"></div>',
            });

            // this.layers = [];
            const myRenderer = L.canvas({
              padding: 0.5,
            });

            this.layers.push(
              // L.circleMarker([lat, lon], {
              //   renderer: myRenderer,
              //   color: this.getRGBofPin(element.id),
              //   fillColor: this.getRGBofPin(element.id),
              //   fill: true,
              //   stroke: false,
              //   fillOpacity: 1,
              // })
              L.marker([lat, lon], {
                icon: myIcon,
              })
            );
          });
        }
        this.value = parseInt(this.timestampManipulation(key));
        this.maxValue =
          this.value + this.windowBetweenFloorAndCeil * 60 * 60 * 1000;

        if (this.layers.length >= 250) {
          this.layers.splice(0, 30);
        }
        // console.log("auta einai ta layers", this.layers);
      }, i * (this.fps * 1000));
    }
  }
}
