import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
    // Assuming value is a timestamp in ISO format
    const date = new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
  }
}
