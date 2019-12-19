import { Injectable } from "@angular/core";

import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";

import { Router } from "@angular/router";

import * as firebase from "firebase";

import { map, tap } from "rxjs/operators";

import Swal from "sweetalert2";

import { Store } from "@ngrx/store";
import {
  ActivarLoadingAction,
  DesactivarLoadingAction
} from "../shared/ui.actions";

import { User } from "./user.model";
import { AppState } from "../app.reducer";
import { SetUserAction, UnsetUserAction } from "./auth.actions";
import { Subscription } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private userSubscription: Subscription = new Subscription();
  private usuario: User;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private afDB: AngularFirestore,
    private store: Store<AppState>
  ) {}

  initAuthListener() {
    this.afAuth.authState.subscribe((fbUser: firebase.User) => {
      if (fbUser) {
        this.userSubscription = this.afDB
          .doc(`${fbUser.uid}/usuario`)
          .valueChanges()
          .subscribe((usuarioObj: any) => {
            const newUser = new User(usuarioObj);
            this.store.dispatch(new SetUserAction(newUser));
            this.usuario = newUser;
          });
      } else {
        this.usuario = null;
        this.userSubscription.unsubscribe();
      }
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
    this.store.dispatch(new ActivarLoadingAction());
    this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then((resp: firebase.auth.UserCredential) => {
        const user: User = {
          uid: resp.user.uid,
          nombre: nombre,
          email: resp.user.email
        };
        this.afDB
          .doc(`${user.uid}/usuario`)
          .set(user)
          .then(() => {
            this.router.navigate(["/"]);
          })
          .catch(error => {
            Swal.fire({
              title: "Error en el registro!",
              text: error.message,
              icon: "error"
            });
          });
      })
      .catch(error => {
        Swal.fire({
          title: "Error en el login!",
          text: error.message,
          icon: "error"
        });
      })
      .finally(() => this.store.dispatch(new DesactivarLoadingAction()));
  }

  login(email: string, password: string) {
    this.store.dispatch(new ActivarLoadingAction());
    this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then((usuario: firebase.auth.UserCredential) => {
        this.router.navigate(["/"]);
      })
      .catch(error => {
        Swal.fire({
          title: "Error en el login!",
          text: error.message,
          icon: "error"
        });
      })
      .finally(() => this.store.dispatch(new DesactivarLoadingAction()));
  }

  logout() {
    this.router.navigate(["/login"]);
    this.afAuth.auth.signOut();
    this.store.dispatch(new UnsetUserAction());
  }

  isAuth() {
    return this.afAuth.authState.pipe(
      tap(fbUser => {
        if (fbUser === null) {
          this.router.navigate(["/login"]);
        }
      }),
      map(fbUser => {
        return fbUser !== null;
      })
    );
  }

  getUsuario() {
    return { ...this.usuario };
  }
}
