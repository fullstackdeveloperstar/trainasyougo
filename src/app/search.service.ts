import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import {JsonpModule, Jsonp, Response} from '@angular/common/http';
// import {Jsonp} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  apiUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=140&type=Yoga&keyword=cruise&key=AIzaSyDz7iXxtwOMovXzKaaWLzStFo1tDLP5PEg";



  constructor(private http: HttpClient) { }

  search() {
  	// return this.http.jsonp(this.apiUrl, 'callback');
  	// const url = "https://archive.org/index.php?output=json&callback=archive";

    // Pass the key for your callback (in this case 'callback')
    // as the second argument to the jsonp method
    // return this.http.jsonp(this.apiUrl,'callback');

  	// this._jsonp.request(this.apiUrl)
   //    .map(res => res.json())
   //    .subscribe((response) => {
   //      console.log(response);
   //    }, (error) => {
   //      console.error(error);
   //    });
  }

}
