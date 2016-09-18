import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Point }   from './point';
import { SquarePointsService } from './square-points.service';

@Component({
  selector: 'my-points',
  templateUrl: 'app/points.component.html',
})


export class PointsComponent implements OnInit {
    points : Point[];
    constructor(
        private squarePointsService: SquarePointsService
    ){};

    getPoints(): void {
        this.squarePointsService.getPoints().then(points => this.points = points);
    }

    add(point:Point):void{
    }

    remove(point: Point): void {

    }
    ngOnInit(): void {
        this.getPoints();
    }
}

