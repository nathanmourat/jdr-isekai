/** Accès au contenu du jeu et au moteur de règles (partagé entre le serveur et les joueurs). */
import { HttpService } from "@rbxts/services";
import contenuJson from "./contenu";
import type { Contenu } from "./moteur";

export const CONTENU = HttpService.JSONDecode(contenuJson) as Contenu;
