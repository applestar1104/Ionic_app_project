import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class CrewSecureStorage {

  constructor(
    private storage: Storage,
  ) { }

  set(key: string, value: any): Promise<any> {
    return this.storage.set(key, value);
  }

  get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  clear(): Promise<any> {
    return this.storage.clear();
  }
}
