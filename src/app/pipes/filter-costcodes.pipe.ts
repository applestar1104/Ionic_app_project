import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterCostcodePipe implements PipeTransform {
  transform(costcodes: any[], searchText: string): any[] {
    if (!costcodes) {
      return [];
    }
    if (!searchText) {
      return costcodes;
    }
    searchText = searchText.toLowerCase();
    return costcodes.filter(costcode => {
      return costcode.title.toLowerCase().indexOf(searchText) !== -1;
    });
  }
}
