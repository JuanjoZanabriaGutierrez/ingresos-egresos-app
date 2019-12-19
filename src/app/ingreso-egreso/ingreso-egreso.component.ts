import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IngresoEgreso } from "./ingreso-egreso.model";
import { IngresoEgresoService } from "./ingreso-egreso.service";
import Swal from "sweetalert2";
import { Store } from "@ngrx/store";
import { AppState } from "../app.reducer";
import { Subscription } from "rxjs";
import {
  ActivarLoadingAction,
  DesactivarLoadingAction
} from "../shared/ui.actions";

@Component({
  selector: "app-ingreso-egreso",
  templateUrl: "./ingreso-egreso.component.html",
  styles: []
})
export class IngresoEgresoComponent implements OnInit, OnDestroy {
  formulario: FormGroup;
  tipo = "ingreso";

  loadingSubs: Subscription = new Subscription();
  cargando: boolean;

  constructor(
    private ingresoEgresoService: IngresoEgresoService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.loadingSubs = this.store
      .select("ui")
      .subscribe(ui => (this.cargando = ui.isLoading));
    this.formulario = new FormGroup({
      descripcion: new FormControl("", Validators.required),
      monto: new FormControl(0, Validators.min(0))
    });
  }

  crearIngresoEgreso() {
    this.store.dispatch(new ActivarLoadingAction());

    const ingresoEgreso = new IngresoEgreso({
      ...this.formulario.value,
      tipo: this.tipo
    });
    this.ingresoEgresoService
      .crearIngresoEgreso(ingresoEgreso)
      .then(() => {
        Swal.fire({
          title: "Creado",
          text: ingresoEgreso.descripcion,
          icon: "success"
        });
        this.formulario.reset({
          monto: 0
        });
      })
      .finally(() => this.store.dispatch(new DesactivarLoadingAction()));
  }
  ngOnDestroy(): void {
    this.loadingSubs.unsubscribe();
  }
}
