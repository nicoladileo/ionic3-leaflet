import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import places from '../../assets/data';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {
  data = places;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }

  ionViewDidEnter() {
    
  }
}
