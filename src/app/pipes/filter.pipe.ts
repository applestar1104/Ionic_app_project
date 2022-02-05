import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(projects: any[], searchText: string): any[] {
    if (!projects) {
      return [];
    }
    if (!searchText) {
      return projects;
    }
    searchText = searchText.toLowerCase();
    return projects.filter(project => {
      return project.projectTitle.toLowerCase().indexOf(searchText) !== -1;
    });
  }
}
