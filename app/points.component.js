"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var square_points_service_1 = require('./square-points.service');
var PointsComponent = (function () {
    function PointsComponent(squarePointsService) {
        this.squarePointsService = squarePointsService;
    }
    ;
    PointsComponent.prototype.getPoints = function () {
        var _this = this;
        this.squarePointsService.getPoints().then(function (points) { return _this.points = points; });
    };
    PointsComponent.prototype.add = function (point) {
    };
    PointsComponent.prototype.remove = function (point) {
    };
    PointsComponent.prototype.ngOnInit = function () {
        this.getPoints();
    };
    PointsComponent = __decorate([
        core_1.Component({
            selector: 'my-points',
            templateUrl: 'app/points.component.html',
        }), 
        __metadata('design:paramtypes', [square_points_service_1.SquarePointsService])
    ], PointsComponent);
    return PointsComponent;
}());
exports.PointsComponent = PointsComponent;
//# sourceMappingURL=points.component.js.map