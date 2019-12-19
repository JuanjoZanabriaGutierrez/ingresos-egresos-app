import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/app.reducer";
import { User } from "src/app/auth/user.model";
import { Subscription, Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { IngresoEgreso } from "src/app/ingreso-egreso/ingreso-egreso.model";
import { IngresoEgresoService } from "src/app/ingreso-egreso/ingreso-egreso.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styles: []
})
export class SidebarComponent implements OnInit, OnDestroy {
  nombre: string;
  subscripcion: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private ingresoEgresoService: IngresoEgresoService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.subscripcion = this.store
      .select("auth")
      .pipe(filter(auth => auth.user !== null))
      .subscribe(({ user }) => {
        this.nombre = user.nombre;
      });
  }

  logout() {
    this.authService.logout();
    this.ingresoEgresoService.cancelarSubscriptions();
  }
  ngOnDestroy(): void {
    this.subscripcion.unsubscribe();
  }
}
