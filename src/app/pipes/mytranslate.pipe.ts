import { Pipe, PipeTransform } from '@angular/core';
import { CrewAppState } from '../providers/crewapp-state';

@Pipe({
  name: 'crewtranslate'
})
export class MyTranslatePipe implements PipeTransform {
  constructor(private crewappstate: CrewAppState) { }

  transform(index: string): string {
    return this.crewappstate.getTranslation(index);
  }
}
