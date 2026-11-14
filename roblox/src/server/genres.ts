/** Genre d'un lieu (auberge, guilde, palais…) : choisit son bâtiment et sa salle intérieure. Sans dépendance. */
import type { LieuDef } from "shared/moteur";

/** Genre d'un lieu, d'après son id et ses propriétés. */
export function genre(l: LieuDef): string {
	const id = l.id;
	const a = (mot: string) => id.find(mot, 1, true)[0] !== undefined;
	if (l.auberge === true) return "auberge";
	if (id === "guilde" || id.sub(1, 7) === "guilde-") return "guilde";
	if (a("palais") || a("residence") || a("citadelle") || a("trone") || a("forteresse") || a("donjon-") || a("etat-major")) return "palais";
	if (a("temple") || a("sanctuaire") || a("autel") || a("bibliotheque") || a("clairiere")) return "temple";
	if (a("campement") || a("camp")) return "camp";
	if (a("mine") || a("forge")) return "mine";
	if (a("ruines") || a("phare") || a("breche") || a("tour-de-guet") || a("puits")) return "ruines";
	if (a("canyon") || a("falaise") || a("nid") || a("crete") || a("plaine-cendree") || a("coulee") || a("petrifiee") || a("lac-de-lave") || a("col-")) return "rochers";
	if (a("port") || a("quai")) return "port";
	if (a("porte") || a("route") || a("mur") || a("ronde") || a("rempart")) return "porte";
	if (l.boutique.size() > 0) return "boutique";
	return "maison";
}
