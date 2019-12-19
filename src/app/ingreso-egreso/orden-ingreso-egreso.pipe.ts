import { Pipe, PipeTransform } from "@angular/core";
import { IngresoEgreso } from "./ingreso-egreso.model";

@Pipe({
  name: "ordenIngresoEgreso"
})
export class OrdenIngresoEgresoPipe implements PipeTransform {
  transform(items: IngresoEgreso[]): any {
    return items.sort((a, b) => {
      if (a.tipo === "ingreso" && b.tipo === "ingreso") {
        return b.monto - a.monto;
      } else if (a.tipo === "ingreso" && b.tipo === "egreso") {
        return -1;
      } else {
        return 1;
      }
    });
  }
}
