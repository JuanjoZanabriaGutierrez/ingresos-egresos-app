import { Injectable } from "@angular/core";

import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";

import { Router } from "@angular/router";

import * as firebase from "firebase";

import { map, tap } from "rxjs/operators";

import Swal from "sweetalert2";

import { User } from "./user.model";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private afDB: AngularFirestore
  ) {}

  initAuthListener() {
    this.afAuth.authState.subscribe((fbUser: firebase.User) => {
      console.log(fbUser);
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
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
      });
  }

  login(email: string, password: string) {
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
      });
  }

  logout() {
    this.router.navigate(["/login"]);
    this.afAuth.auth.signOut();
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
}
