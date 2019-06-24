import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { FormControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {
  formDownload: FormGroup;
  locationList: FormArray;
  minDate: Date;
  maxDate: Date;

  dataSources = [
    { value: 'CHIRPS', viewValue: 'CHIRPS', availability: '(availability: from 1998-01-01 – date)'  },
    { value: 'CMORPH', viewValue: 'CMORPH', availability: '(availability: from 2014-10-01 – 2016-12-31)'  },
    { value: 'CMORPH_NRT', viewValue: 'CMORPH_NRT', availability: '(availability: from 2017-01-01 – date)'  },
    { value: 'GSMAP_STD', viewValue: 'GSMAP_STD', availability: '(availability: from 2014-03-01 – date)'  },
    { value: 'GSMAP_NRT', viewValue: 'GSMAP_NRT', availability: '(availability: from 2017-07-01 – date)'  },
    { value: 'IMERG', viewValue: 'IMERG', availability: '(availability: from 2014-03-01 – date)'  },
    { value: 'TRMM', viewValue: 'TRMM', availability: '(availability: from 1998-01-01 – 2017-09-13)'  },
    { value: 'TRMM_NRT', viewValue: 'TRMM_NRT', availability: '(availability: from 2017-02-27 – date)'  }
  ];

  frequencyOption = [
    { value: 'daily', viewValue: 'Daily'},
    { value: 'monthly', viewValue: 'Monthly'}
  ];

  statisticOption = [
    { value: 'raw', viewValue: 'Raw'},
    { value: 'mean', viewValue: 'Mean'},
    { value: 'sum', viewValue: 'Sum'}
  ];

  formatOption = [
    { value: 'time_series', viewValue: 'Time Series'},
    { value: 'tabular', viewValue: 'Tabular'}
  ];

  // returns all form groups under locations
  get locationFormGroup() {
    return this.formDownload.get('locations') as FormArray;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formDownload = this.fb.group({
      selectSource: [ '', Validators.required ],
      selectFrequency: [ '', Validators.required ],
      selectStatistic: [ '', Validators.required ],
      selectFormat: [ '', Validators.required ],
      locations: this.fb.array([this.createLocation()]),
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });

    // set locationList to this field
    this.locationList = this.formDownload.get('locations') as FormArray;
  }

    dataSourceChange = () => {
      if (this.formDownload.get('selectSource').value === 'CHIRPS') {
        this.minDate = new Date(1998, 1, 1);
        this.maxDate = new Date();
      }
      else if (this.formDownload.get('selectSource').value === 'CMORPH') {
        this.minDate = new Date(2014, 10, 1);
        this.maxDate = new Date();
      }
      else if (this.formDownload.get('selectSource').value === 'CMORPH_NRT') {
        this.minDate = new Date(2017, 1, 1);
        this.maxDate = new Date();
      }
      else if (this.formDownload.get('selectSource').value === 'GSMAP_STD') {
        this.minDate = new Date(2014, 3, 1);
        this.maxDate = new Date();
      }
      else if (this.formDownload.get('selectSource').value === 'GSMAP_NRT') {
        this.minDate = new Date(2017, 7, 1);
        this.maxDate = new Date();
      }
      else if (this.formDownload.get('selectSource').value === 'IMERG') {
        this.minDate = new Date(2014, 3, 1);
        this.maxDate = new Date();
      }
      else if (this.formDownload.get('selectSource').value === 'TRMM') {
        this.minDate = new Date(1998, 1, 1);
        this.maxDate = new Date(2017, 9, 13);
      }
      else if (this.formDownload.get('selectSource').value === 'TRMM_NRT') {
        this.minDate = new Date(2017, 2, 27);
        this.maxDate = new Date();
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

  // triggered to change validation of value field type
  changedFieldType(index) {
    let validators = null;

    this.getlocationsFormGroup(index).controls['value'].setValidators(
      validators
    );

    this.getlocationsFormGroup(index).controls['value'].updateValueAndValidity();
  }

  // get the formgroup under locations form array
  getlocationsFormGroup(index): FormGroup {
    // this.locationList = this.form.get('locations') as FormArray;
    const formGroup = this.locationList.controls[index] as FormGroup;
    return formGroup;
  }

  // download
  download() {
    console.log(this.formDownload.value);
  }
}
