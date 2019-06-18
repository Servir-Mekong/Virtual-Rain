import { Component, OnInit } from '@angular/core';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  tiles: Tile[] = [
      {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
      {text: 'Two', cols: 2, rows: 2, color: 'lightgreen'},
      {text: 'Three', cols: 1, rows: 2, color: 'lightpink'}
    ];
  constructor() { }

  ngOnInit() {
  }

}
