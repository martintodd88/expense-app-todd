import { Component } from '@angular/core';
import { Photo, PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public Totalmoney:number = 0;

  updateTotal(x) {
    this.Totalmoney -= x;
    
  }

  
  constructor(public photoService: PhotoService ) {

    }

    
 
  
}
