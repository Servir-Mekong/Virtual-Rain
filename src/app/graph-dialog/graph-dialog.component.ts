import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { DataService } from '../services/data.service';

import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';
const Exporting = require('highcharts/modules/exporting');
const ExportData = require('highcharts/modules/export-data');

Exporting(Highcharts);
ExportData(Highcharts);

@Component({
  selector: 'app-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.css']
})
export class GraphDialogComponent implements OnInit, AfterViewInit {

  dialogTitle: string;
  chartOptions: Highcharts.Options;
  chart: Highcharts.ChartObject;
  @ViewChild('graphDialogContent') private graphDialogContentEl: ElementRef;

  constructor(private dataService: DataService) { }

  ngOnInit () {
    this.dataService.getDialogTitle().subscribe(title => {
      this.dialogTitle = title;
    });

    this.dataService.getDialogContentOptions().subscribe(chartOptions => {
      this.chartOptions = chartOptions;
    });
  }

  ngAfterViewInit () {
    this.chart = chart(this.graphDialogContentEl.nativeElement, this.chartOptions);
  }

}
