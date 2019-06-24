import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { MatDialog } from '@angular/material';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';
import { DataService } from '../services/data.service';
import { DownloadApiService } from '../services/download-api.service';

const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'LL',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.css'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class DownloadComponent implements OnInit {
    formDownload: FormGroup;
    locationList: FormArray;
    minDate: Date;
    maxDate: Date;
    selectedSatellite: string;
    selectDate:string;
    selectedStartDate;
    selectedEndDate;
    selectedFormat: string;
    selectedFrequency: string;
    selectSource: string;
    selectedStatistic: string;
    layer_id: string;
    location: any;
    valueXY: any[ ] = [ ];
    graphData: any[ ] = [ ];
    pixelVal;
    selectedSource: string;
    showSpinner: boolean = true;
    btn_chart:  boolean = true;



    dataSources = [
        // { value: 'chirps', viewValue: 'CHIRPS', availability: '(availability: from 1998-01-01 – date)', disabled: true  },
        // { value: 'cmorph', viewValue: 'CMORPH', availability: '(availability: from 2014-10-01 – 2016-12-31)', disabled: true   },
        { value: 'cmorph', viewValue: 'CMORPH', availability: '(availability: from 2017-01-01 – date)', disabled: false   },
        // { value: 'gsmap', viewValue: 'GSMAP_STD', availability: '(availability: from 2014-03-01 – date)', disabled: true   },
        { value: 'gsmap_nrt', viewValue: 'GSMAP_NRT', availability: '(availability: from 2017-07-01 – date)', disabled: false   },
        { value: 'imerg', viewValue: 'IMERG', availability: '(availability: from 2014-03-01 – date)', disabled: false   },
        // { value: 'trmm', viewValue: 'TRMM', availability: '(availability: from 1998-01-01 – 2017-09-13)', disabled: true   },
        { value: 'trmm_nrt', viewValue: 'TRMM_NRT', availability: '(availability: from 2017-02-27 – date)', disabled: false   }
    ];

    frequencyOption = [
        { value: 'daily', viewValue: 'Daily', disabled: false},
        { value: 'monthly', viewValue: 'Monthly', disabled: true}
    ];

    statisticOption = [
        { value: 'raw', viewValue: 'Raw', disabled: false},
        { value: 'mean', viewValue: 'Mean', disabled: true},
        { value: 'sum', viewValue: 'Sum', disabled: true}
    ];

    formatOption = [
        { value: 'time_series', viewValue: 'Time Series', disabled: false},
        { value: 'tabular', viewValue: 'Tabular', disabled: true}
    ];

    // returns all form groups under locations
    get locationFormGroup() {
        return this.formDownload.get('locations') as FormArray;
    }

    constructor(private fb: FormBuilder,
        private downloadApiService: DownloadApiService,
        private dataService: DataService,
        public dialog: MatDialog
    ){}

    ngOnInit() {
        this.formDownload = this.fb.group({
            selectSource: [ '', Validators.required ],
            selectFrequency: [ '', Validators.required ],
            selectStatistic: [ '', Validators.required ],
            // selectFormat: [ '', Validators.required ],
            locations: this.fb.array([this.createLocation()]),
            startDate: [ new Date().toISOString().split("T")[0], Validators.required ],
            endDate: [ new Date().toISOString().split("T")[0], Validators.required ],
        });
        this.selectedFrequency = 'daily';
        this.selectedStatistic = 'raw';
        // this.selectedFormat = 'time_series';
        // set locationList to this field
        this.locationList = this.formDownload.get('locations') as FormArray;
    }

    dataSourceChange = () => {
        if (this.formDownload.get('selectSource').value === 'chirps') {
            this.minDate = new Date(1998, 1, 1);
            this.maxDate = new Date();
            this.selectedSource = 'chirps';
        }
        // else if (this.formDownload.get('selectSource').value === 'cmorph') {
        //     this.minDate = new Date(2014, 10, 1);
        //     this.maxDate = new Date();
        // }
        else if (this.formDownload.get('selectSource').value === 'cmorph') {
            this.minDate = new Date(2017, 1, 1);
            this.maxDate = new Date();
            this.selectedSource = 'cmorph';
        }
        else if (this.formDownload.get('selectSource').value === 'gsmap') {
            this.minDate = new Date(2014, 3, 1);
            this.maxDate = new Date();
            this.selectedSource = 'gsmap';
        }
        else if (this.formDownload.get('selectSource').value === 'gsmap_nrt') {
            this.minDate = new Date(2017, 7, 1);
            this.maxDate = new Date();
            this.selectedSource = 'gsmap';
        }
        else if (this.formDownload.get('selectSource').value === 'imerg') {
            this.minDate = new Date(2014, 3, 1);
            this.maxDate = new Date();
            this.selectedSource = 'imerg';
        }
        else if (this.formDownload.get('selectSource').value === 'trmm') {
            this.minDate = new Date(1998, 1, 1);
            this.maxDate = new Date(2017, 9, 13);
            this.selectedSource = 'trmm';
        }
        else if (this.formDownload.get('selectSource').value === 'trmm_nrt') {
            this.minDate = new Date(2017, 2, 27);
            this.maxDate = new Date();
            this.selectedSource = 'trmm';
        }
    };
    // location formgroup
    createLocation(): FormGroup {
        return this.fb.group({
            lat: [null, Validators.required],
            lon: [null, Validators.required]
        });
    }
    // add a location form group
    addLocation() {
        this.locationList.push(this.createLocation());
    }

    // remove location from group
    removeLocation(index) {
        // this.locationList = this.form.get('locations') as FormArray;
        this.locationList.removeAt(index);
    }

    // get the formgroup under locations form array
    getlocationsFormGroup(index): FormGroup {
        // this.locationList = this.form.get('locations') as FormArray;
        const formGroup = this.locationList.controls[index] as FormGroup;
        return formGroup;
    }

    openGraphDialog = (chartTitle: string, yAxisTitle: string, data) => {
        // this.dataService.setDialogTitle(dialogTitle);
        this.dataService.setDialogContentOptions2(chartTitle, yAxisTitle, data);
        const dialogRef = this.dialog.open(GraphDialogComponent,{
            height: '70vh',
            width: '70vw'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Dialog closed');
            [].forEach.call(document.querySelectorAll('.highcharts-data-table'), function (el) {
                    el.style.display = 'none';
                });
        });

    };

    async callWmsService(layer,index) {
        this.pixelVal = '';
        await this.downloadApiService.getData({
            location: '',
            satellite: this.selectedSource,
            layer_id: layer,
            lat: this.formDownload.value['locations'][index]['lat'],
            lng: this.formDownload.value['locations'][index]['lon'],
        }).subscribe(response => {
            var obj = Object.keys( response['features'][0]['properties'] );
            this.pixelVal = response['features'][0]['properties'][obj[0]].toFixed(2);
        });
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    resolve(this.pixelVal);
                }, 500);
            }
            catch (err) {
                reject(new Error('Oops!'));
            }
        });
    }

    //get value of each date
    async getFeatureInfoxy(i) {
        this.valueXY = [ ];
        let now = new Date();
        let id, dateString, datalabel;
        let startDate = new Date(this.formDownload.value['startDate']);
        let endDate = new Date(this.formDownload.value['endDate']);
        let lat, lng;
        let location_len = this.formDownload.value['locations'].length;
        for(var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)){
            datalabel = date.getFullYear().toString() + '/' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '/' + ((date.getDate()) >= 10 ? (date.getDate()) : '0' + (date.getDate()));
            dateString = date.getFullYear().toString() + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + ((date.getDate()) >= 10 ? (date.getDate()) : '0' + (date.getDate()));
            switch (this.formDownload.value['selectSource']) {
                case 'cmorph':
                id = 'MK_CMORPH_V0.x_RAW_0.25deg-DLY_00Z_' + dateString;
                break;
                case 'gsmap':
                id = 'MK_gsmap_gauge.' + dateString + '.0.1d.daily.00Z-23Z';
                break;
                case 'gsmap_nrt':
                id = 'MK_gsmap_gauge.' + dateString + '.0.1d.daily.00Z-23Z';
                break;
                case 'imerg':
                id = 'MK_3B-DAY-E.MS.MRG.3IMERG.' + dateString + '-S000000-E235959.V05';
                break;
                case 'trmm':
                dateString = date.getFullYear().toString() + '.' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '.' + ((date.getDate()) >= 10 ? (date.getDate()) : '0' + (date.getDate()));
                id = 'MK_3B42RT_daily.' + dateString + '.7';
                break;
                case 'trmm_nrt':
                dateString = date.getFullYear().toString() + '.' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '.' + ((date.getDate()) >= 10 ? (date.getDate()) : '0' + (date.getDate()));
                id = 'MK_3B42RT_daily.' + dateString + '.7';
                break;
            }
            await this.callWmsService(id,i).then(data =>  {
                this.valueXY.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),Number(data)]);
            });
        }
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    resolve(this.valueXY);
                }, 500);
            }
            catch (err) {
                reject(new Error('Oops!'));
            }
        });
    }

    // getvalue of each location
    async getvalue() {
        this.graphData = [ ];
        let lat, lng;
        let location_len = this.formDownload.value['locations'].length;
        for(var i=0; i < location_len; i++){
            await this.getFeatureInfoxy(i).then(data =>  {
                this.graphData.push({
                    'name': 'Location: '+ (i+1),
                    'data': this.valueXY
                })
            });

        }
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    resolve(this.graphData);
                }, 500);
            }
            catch (err) {
                reject(new Error('Oops!'));
            }
        });
    }

    //showChart
    async openChart(){
        this.showSpinner = false;
        this.btn_chart = false;
        await this.getvalue().then(data =>  {
            this.openGraphDialog('Timeseries of Precipitation', 'Precipitation (mm)', data );
            this.showSpinner = true;
            this.btn_chart = true;
        });
    }

    //Download CSV
    async downloadCSV(){
    }
}
