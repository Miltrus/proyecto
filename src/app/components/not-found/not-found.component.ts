import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit{

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.replaceStateWithNotFoundURL();
  }

  replaceStateWithNotFoundURL(): void {
    const currentUrl = this.location.path();
    const notFoundUrl = `/not-found${currentUrl}`;
    window.history.replaceState({}, '', notFoundUrl);
  }

  goBack(): void {
    this.location.back();
  }
}
