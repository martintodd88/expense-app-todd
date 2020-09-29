import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';
import { Platform } from '@ionic/angular';


const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;
  
  

  constructor(platform: Platform) {
    this.platform = platform;
   }



     public async loadSaved() {
    
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photoList.value) || [];

   
    if (!this.platform.is('hybrid')) {
      
      for (let photo of this.photos) {
       
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
        });
      
        
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }



 
  public async addNewToGallery(x) {
    
    if (x!=""){
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri, 
        source: CameraSource.Camera, 
        quality: 100 
      });

 const timestamp : Date = new Date();
 const amount = x;
 
 

 

 
    const savedImageFile = await this.savePicture(capturedPhoto,timestamp,amount);

    
    this.photos.unshift(savedImageFile);

   
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

  }

  else alert("Expense amount must be input")
  }

 
  private async savePicture(cameraPhoto: CameraPhoto,timestamp: Date,amount:Number) {
    
    const base64Data = await this.readAsBase64(cameraPhoto);
   

    
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    if (this.platform.is('hybrid')) {
     
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        amount,timestamp
        
      };
    }
    else {
     
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath,
        amount,timestamp
        
      };
    }
  }

 
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    
    if (this.platform.is('hybrid')) {
     
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {
      
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;  
    }
  }

  
  public async deletePicture(photo: Photo, position: number) {
    
    this.photos.splice(position, 1);

    
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

   
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data
    });
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export interface Photo {
  filepath: string;
  webviewPath: string;
  timestamp:Date;
  amount?:Number;
  
}