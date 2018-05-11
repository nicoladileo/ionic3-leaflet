import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
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

  constructor(public navCtrl: NavController, public geolocation:Geolocation, public alertController: AlertController) {

  }

  ionViewDidEnter() {
    if (this.map == null)
      this.loadmap();
    if (this.map != null) {
      this.removeHereMarker();
      this.getLocation();
      this.addPlaces();
    }
     
  }

  loadmap() {
    this.map = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);
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

  getLocation() {
    if (this.map == null)
      return;
    this.geolocation.getCurrentPosition().then((resp) => {
      this.currentPosition = resp;
      this.markerGroup = leaflet.featureGroup();
      let marker: any = leaflet.marker([resp.coords.latitude, resp.coords.longitude]).on('click', () => { 
        var popup = leaflet.popup()
              .setLatLng([resp.coords.latitude, resp.coords.longitude])
              .setContent("<p>Your position</p>")
              .openOn(this.map);
        popup.openPopup();
      });
      this.markerGroup.addLayer(marker);
      this.map.addLayer(this.markerGroup);
      var latlngs = [marker.getLatLng()];
      var markerBounds = leaflet.latLngBounds(latlngs);
      this.map.fitBounds(markerBounds, {maxZoom: 16});
      }).catch((error) => {
        let alert = this.alertController.create({
          title: "GPS Error",
          message: "Ensure that GPS is enabled and ready"
        });
        alert.present();
      });
  }

  removeHereMarker() {
    if (this.map == null || this.markerGroup == undefined)
      return;
    this.map.removeLayer(this.markerGroup);
  }

  updateLocation() {
    this.removeHereMarker();
    this.getLocation();
  }
}
