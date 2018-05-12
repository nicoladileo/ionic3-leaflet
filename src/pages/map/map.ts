import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Observable } from 'rxjs/Rx';
import leaflet from 'leaflet';
import places from '../../assets/data';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  currentPosition: Geoposition;
  markerGroup: any;
  placesGroup: any;
  data = places;
  gpsEnabled: boolean;

  constructor(public navCtrl: NavController, public geolocation:Geolocation, 
              public alertController: AlertController, public locationAccuracy: LocationAccuracy) {
              
  }

  ionViewDidEnter() {
    if (this.map == null)
      this.loadmap();
    let promises = new Array();
    promises.push(this.requestLocation());
    promises.push(this.getLocation());
    Observable.forkJoin(promises).subscribe((data:any) => {
      this.currentPosition = data[1];
      this.removeHereMarker();
      this.addHereMarker();
      this.addPlaces();
    },
    (err:any) => {
      if (this.map == null)
        this.loadmap();
      let alert = this.alertController.create({
        title: "GPS Error",
        message: "Ensure that GPS is enabled and ready"
      });
      alert.present();
    });    
    
  }

  addHereMarker() {
    this.markerGroup = leaflet.featureGroup();
    let marker: any = leaflet.marker([this.currentPosition.coords.latitude, this.currentPosition.coords.longitude]).on('click', () => { 
      var popup = leaflet.popup()
            .setLatLng([this.currentPosition.coords.latitude, this.currentPosition.coords.longitude])
            .setContent("<p>You are here</p>")
            .openOn(this.map);
      popup.openPopup();
    });
    var latLngs = [ marker.getLatLng() ];
    var markerBounds = leaflet.latLngBounds(latLngs);
    this.map.fitBounds(markerBounds);
    this.markerGroup.addLayer(marker);
    this.map.addLayer(this.markerGroup);
  }

  addPlaces() {
    this.placesGroup = leaflet.featureGroup();
    for (let p of this.data.places) {
      let placeMarker = leaflet.marker([p.lat, p.lng]).on('click', () => {
        var popup = leaflet.popup()
              .setLatLng([p.lat, p.lng])
              .setContent(`<h3>` + p.title + `</h3>` + 
                          `<p>` + p.description + `</p>` +
                          `<img src="` + p.url + `"</img>`)
              .openOn(this.map);
        popup.openPopup();
      });
      this.placesGroup.addLayer(placeMarker);
    }
    this.map.addLayer(this.placesGroup);
  }

  getLocation() : Promise<Geoposition> {
    return this.geolocation.getCurrentPosition();
  }

  loadmap() {
    this.map = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);
  }

  removeHereMarker() {
    if (this.map == null || this.markerGroup == undefined)
      return;
    this.map.removeLayer(this.markerGroup);
  }

  requestLocation() : Promise<void> {
    return this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if(canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            this.gpsEnabled = true;
          },
          error => {
            this.gpsEnabled = false;
            let alert = this.alertController.create({
              title: "GPS Error",
              message: "Ensure that GPS is enabled and ready"
            });
            alert.present();
          }
        );
      }
    });
  }

  updateLocation() {
    if (this.map != null) {
      let promises = new Array();
      promises.push(this.requestLocation());
      promises.push(this.getLocation());
      Observable.forkJoin(promises).subscribe((data:any) => {
        this.currentPosition = data[1];
        this.removeHereMarker();
        this.addHereMarker();
        this.addPlaces();
      },
      (err:any) => {
        let alert = this.alertController.create({
          title: "GPS Error",
          message: "Ensure that GPS is enabled and ready"
        });
        alert.present();
      });    
    }     
  }
}
