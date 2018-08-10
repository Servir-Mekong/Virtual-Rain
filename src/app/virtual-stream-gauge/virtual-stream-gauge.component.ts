import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-virtual-stream-gauge',
  templateUrl: './virtual-stream-gauge.component.html',
  styleUrls: ['./virtual-stream-gauge.component.css']
})
export class VirtualStreamGaugeComponent implements OnInit {

  countries = [
    { value: 'cambodia', viewValue: 'Cambodia' },
    { value: 'lao', viewValue: 'Lao PDR' },
    { value: 'myanmar', viewValue: 'Myanmar' },
    { value: 'thailand', viewValue: 'Thailand' },
    { value: 'vietnam', viewValue: 'Vietnam' }
  ];

  satellites = [
    { value: 'jason', viewValue: 'Jason-2/3' },
    { value: 'sentinel', viewValue: 'Sentinel' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
