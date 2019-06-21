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
    // Apply styles inline because stylesheets are not passed to the exported SVG
    let tableClass = document.querySelector('.highcharts-data-table');
    if(tableClass instanceof HTMLElement){
        tableClass.style.fontSize = '14px';
    }
    let tableElement = document.querySelector('.highcharts-data-table table');
    if(tableElement instanceof HTMLElement){
        tableElement.style.fontFamily = 'Arial';
        tableElement.style.borderSpacing = '0';
        tableElement.style.minWidth = '100%';
        tableElement.style.borderCollapse = 'collapse';
        tableElement.style.background = 'white';
        tableElement.style.color = '#333333';
    }
    [].forEach.call(document.querySelectorAll('.highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption'), function (el, i) {
            el.style.border = '1px solid silver';
            el.style.padding = '5px';
        });
    [].forEach.call(document.querySelectorAll('caption'), function (el, i) {
            el.style.fontWeight = 'bold';
            el.style.borderBottom = 'none';
        });
    [].forEach.call(document.querySelectorAll('caption, tr'), function (el, i) {
            if (i % 2) {
                el.style.background = '#f8f8f8';
            }
        });
  }

}
