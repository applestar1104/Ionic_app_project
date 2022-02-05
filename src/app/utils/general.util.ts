import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as moment from 'moment';
import * as turf from '@turf/turf';

declare var google: any;

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function isToday(dateString: string, timeZone: string) {
  const dateVal = moment(dateString).tz(timeZone);
  const today = moment(new Date()).tz(timeZone);

  return dateVal.isSame(today, 'day');
}

export function getMilesBetweenCoords(coordinateFrom, coordinateTo) {
  if (coordinateFrom && coordinateTo) {
    const from = turf.point([coordinateFrom.lat, coordinateFrom.lng]);
    const to = turf.point([coordinateTo.lat, coordinateTo.lng]);
    const options = { units: 'miles' as turf.Units };

    return turf.distance(from, to, options);
  }

  return null;
}

export function getAddress(address) {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        resolve(results[0].geometry.location);
      } else {
        reject(status);
      }
    });
  });
}
