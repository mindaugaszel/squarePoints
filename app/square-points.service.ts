import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Point } from './point';
import { POINTS } from './mock-points';

@Injectable()
export class SquarePointsService {
    private appUrl = 'app/points';
    constructor(
        private http:Http
    ){}
    private headers = new Headers({'Content-Type': 'application/json'});
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
    addPoint(point:Point):Promise<Point>{
        return this.http
            .post(this.appUrl, JSON.stringify({name: name}), {headers: this.headers})
            .toPromise()
            .then(res => res.json().data)
            .catch(this.handleError);
    }
    removePoint(id:number):Promise<void>{
    let url = `${this.appUrl}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
    }
    getPoints(): Promise<Point[]> {
        return Promise.resolve(POINTS);
    }
    getPointsSlowly(): Promise<Point[]> {
        return new Promise<Point[]>(resolve =>
            setTimeout(resolve, 2000)) // delay 2 seconds
            .then(() => this.getPoints());
    }
}