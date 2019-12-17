// 自定义管道
import { Pipe, PipeTransform } from '@angular/core';

// 数组输出
@Pipe({ name: 'arrayToString' })
export class ArrayToStringPipe implements PipeTransform {
  transform(value: Array<any>, defaultStr = '', split = ',', key?: string): string {
    if (value.length) {
      let strs;
      if (key) {
        strs = new Array();
        for (let v of value) {
          for (let k in v) {
            if (k == key) {
              strs.push(v[k]);
            }
          }
        }
      } else {
        strs = value;
      }
      return strs.join(split);
    } else {
      return defaultStr;
    }
  }
}