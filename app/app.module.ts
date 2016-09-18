import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PointsComponent } from './points.component';
import { SquarePointsService } from './square-points.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    PointsComponent,
    /*DashboardComponent,
    PointSetsComponent,
    SquaresComponent,*/
  ],
  providers: [
    SquarePointsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
