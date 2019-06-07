import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AboutComponent } from './about/about.component';
import { MapComponent } from './map/map.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { VirtualRainGaugeComponent } from './virtual-rain-gauge/virtual-rain-gauge.component';
import { VirtualStreamGaugeComponent } from './virtual-stream-gauge/virtual-stream-gauge.component';
import { DrawToolbarComponent } from './draw-toolbar/draw-toolbar.component';
//import { MapService } from './services/map.service';
import { ApiService } from './services/api.service';
import { MessageService } from './services/message.service';
import { HttpErrorHandler } from './services/http-error-handler.service';
import { TimeSliderComponent } from './time-slider/time-slider.component';
import { GraphDialogComponent } from './graph-dialog/graph-dialog.component';
import { MapviewerComponent } from './mapviewer/mapviewer.component';
import { DownloadComponent } from './download/download.component';

const appRoutes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'download', component: DownloadComponent },
  { path: '', component: MapviewerComponent }
];

@NgModule({
   declarations: [
      AppComponent,
      HeaderComponent,
      AboutComponent,
      MapComponent,
      FileUploadComponent,
      VirtualRainGaugeComponent,
      VirtualStreamGaugeComponent,
      DrawToolbarComponent,
      TimeSliderComponent,
      GraphDialogComponent,
      MapviewerComponent,
      DownloadComponent
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      FormsModule,
      HttpClientModule,
      MatAutocompleteModule,
      MatBadgeModule,
      MatBottomSheetModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatCardModule,
      MatCheckboxModule,
      MatChipsModule,
      MatDatepickerModule,
      MatDialogModule,
      MatDividerModule,
      MatExpansionModule,
      MatGridListModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatNativeDateModule,
      MatPaginatorModule,
      MatProgressBarModule,
      MatProgressSpinnerModule,
      MatRadioModule,
      MatRippleModule,
      MatSelectModule,
      MatSidenavModule,
      MatSliderModule,
      MatSlideToggleModule,
      MatSnackBarModule,
      MatSortModule,
      MatStepperModule,
      MatTableModule,
      MatTabsModule,
      MatToolbarModule,
      MatTooltipModule,
      MatTreeModule,
      ReactiveFormsModule,
      RouterModule.forRoot(appRoutes)
   ],
   providers: [
      //MapService
      ApiService,
      MessageService,
      HttpErrorHandler
   ],
   bootstrap: [
      AppComponent
   ],
   entryComponents: [
    GraphDialogComponent
   ]
})
export class AppModule { }
