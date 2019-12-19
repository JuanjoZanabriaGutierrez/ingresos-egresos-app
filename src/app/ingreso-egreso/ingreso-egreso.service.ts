import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { IngresoEgreso } from "./ingreso-egreso.model";
import { AuthService } from "../auth/auth.service";
import { Store } from "@ngrx/store";
import { AppState } from "../app.reducer";
import { filter, map } from "rxjs/operators";
import { pipe, Subscription } from "rxjs";
import { SetItemsAction, UnsetItemsAction } from "./ingreso-egreso.actions";

@Injectable({
  providedIn: "root"
})
export class IngresoEgresoService {
  ingresoEgresoListenerSubscription: Subscription = new Subscription();
  ingresoEgresoItemsSubscription: Subscription = new Subscription();

  constructor(
    private afDB: AngularFirestore,
    private authService: AuthService,
    private store: Store<AppState>
  ) {}

  initIngresoEgresoListener() {
    this.ingresoEgresoListenerSubscription = this.store
      .select("auth")
      .pipe(filter(auth => auth.user !== null))
      .subscribe(auth => {
        this.ingresoEgresoItems(auth.user.uid);
      });
  }

  crearIngresoEgreso(ingresoEgreso: IngresoEgreso) {
    const user = this.authService.getUsuario();
    return this.afDB
      .doc(`${user.uid}/ingresos-egresos`)
      .collection("items")
      .add({ ...ingresoEgreso });
  }

  borrarIngresoEgreso(uid: string) {
    const user = this.authService.getUsuario();
    return this.afDB.doc(`${user.uid}/ingresos-egresos/items/${uid}`).delete();
  }

  cancelarSubscriptions() {
    this.ingresoEgresoListenerSubscription.unsubscribe();
    this.ingresoEgresoItemsSubscription.unsubscribe();
    this.store.dispatch(new UnsetItemsAction());
  }

  private ingresoEgresoItems(uid: string) {
    this.ingresoEgresoItemsSubscription = this.afDB
      .collection(`${uid}/ingresos-egresos/items`)
      .snapshotChanges()
      .pipe(
        map(docData => {
          return docData.map(doc => {
            return {
              uid: doc.payload.doc.id,
              ...(doc.payload.doc.data() as IngresoEgreso)
            };
          });
        })
      )
      .subscribe((coleccion: IngresoEgreso[]) => {
        this.store.dispatch(new SetItemsAction(coleccion));
      });
  }
}
