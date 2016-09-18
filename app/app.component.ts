import { Component } from '@angular/core';

@Component({
    selector:   'my-app',
    template:`
        <h1>{{title}}</h1>
        <my-points></my-points>
    `
})
export class AppComponent {
  title = 'THE Title'
}