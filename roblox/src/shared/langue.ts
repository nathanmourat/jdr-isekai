/**
 * Langues du jeu (version Roblox) : français (langue d'origine), anglais, espagnol, allemand, japonais.
 *
 * Trois sortes de textes :
 *  - l'interface : `tr("Fermer")`, ou `trf("Niveau {n} !", { n: 3 })` pour un texte avec des valeurs ;
 *  - le contenu (histoire, lieux, objets…) : traduit directement dans CONTENU chez le joueur (`definirLangue`),
 *    donc tout ce que le moteur en tire (répliques, noms, dates) arrive déjà traduit ;
 *  - les phrases fabriquées par le moteur (« X inflige 12 dégâts à Y ») : `trMoteur`, par modèles de phrases.
 * Les traductions sont dans `traductions/` (à la racine du dépôt), exportées par `npm run roblox:traductions`
 * vers shared/traductions/<langue>.lua. Un texte sans traduction reste en français.
 * Le serveur ne traduit rien : tout se fait chez chaque joueur, dans sa langue.
 */
import { HttpService } from "@rbxts/services";
import { CONTENU } from "./donnees";

export type Langue = "fr" | "en" | "es" | "de" | "ja";

export const LANGUES: { id: Langue; nom: string; drapeau: string }[] = [
	{ id: "fr", nom: "Français", drapeau: "🇫🇷" },
	{ id: "en", nom: "English", drapeau: "🇬🇧" },
	{ id: "es", nom: "Español", drapeau: "🇪🇸" },
	{ id: "de", nom: "Deutsch", drapeau: "🇩🇪" },
	{ id: "ja", nom: "日本語", drapeau: "🇯🇵" },
];

/** Contenu d'un module shared/traductions/<langue>.lua (une fois décodé). */
interface Catalogue {
	/** texte français exact → traduction (interface et contenu) */
	textes: Record<string, string>;
	/** modèles de phrases du moteur : [motif français, traduction], valeurs notées {1}, {2}… */
	motifs: [string, string][];
}

let langue: Langue = "fr";
let textes: Record<string, string> = {};
let motifs: { lua: string; vers: string }[] = [];
const cacheMoteur = new Map<string, string>();
const ecouteurs: (() => void)[] = [];

export function langueActuelle(): Langue {
	return langue;
}

/** Langue proposée au premier lancement, d'après la langue du compte Roblox (« en-us » → anglais). */
export function langueDuCompte(codeRoblox: string): Langue {
	const c = codeRoblox.lower().sub(1, 2);
	for (const l of LANGUES) if (l.id === c) return l.id;
	return c === "" ? "fr" : "en";
}

/** Appelé quand la langue change (pour tout redessiner). */
export function surChangementLangue(f: () => void) {
	ecouteurs.push(f);
}

// ───────────────────────────── Traduction du contenu, sur place ─────────────────────────────

/** Clés du contenu dont la valeur est un texte affiché (les identifiants ne sont jamais traduits). */
const CLES_TEXTE = new Set([
	"nom", "dit", "description", "texte", "titre", "objectif", "phrase", "reussite", "echec", "resume", "bouton",
	"resultat", "journal", "combat", "utilite", "accueil", "pouvoir_unique", "hors_combat", "role", "point_fort",
	"point_faible", "avantage", "defaut", "personnalite", "passe", "repliques", "repliques_blessure",
]);

/** Places du contenu qui contiennent un texte (table + clé), avec le texte français d'origine. */
let places: { t: Record<string | number, unknown>; k: string | number; fr: string }[] | undefined;

function estIdentifiant(s: string): boolean {
	return s.match("^[%l%d_%-]+$")[0] !== undefined;
}

function relever() {
	const liste: { t: Record<string | number, unknown>; k: string | number; fr: string }[] = [];
	const vus = new Set<unknown>();
	const parcourir = (x: unknown, texte: boolean) => {
		if (!typeIs(x, "table") || vus.has(x)) return;
		vus.add(x);
		const t = x as Record<string | number, unknown>;
		for (const [k, v] of pairs(t)) {
			const cleTexte = typeIs(k, "string") ? CLES_TEXTE.has(k) : texte;
			if (typeIs(v, "string")) {
				if (cleTexte && !estIdentifiant(v)) liste.push({ t, k, fr: v });
			} else parcourir(v, cleTexte);
		}
	};
	parcourir(CONTENU, false);
	return liste;
}

function chargerCatalogue(l: Langue): Catalogue | undefined {
	if (l === "fr") return undefined;
	const dossier = script.Parent?.FindFirstChild("traductions");
	const module = dossier?.FindFirstChild(l);
	if (!module || !module.IsA("ModuleScript")) return undefined;
	const [ok, res] = pcall(() => HttpService.JSONDecode(require(module) as string) as Catalogue);
	return ok ? res : undefined;
}

/** Échappe un texte pour un motif Lua. */
function echapper(s: string): string {
	return s.gsub("[%(%)%.%%%+%-%*%?%[%]%^%$]", "%%%0")[0];
}

/**
 * Change la langue : charge le catalogue, traduit CONTENU sur place (à partir du français d'origine,
 * gardé de côté au premier appel), puis prévient l'interface.
 */
export function definirLangue(l: Langue) {
	const cat = chargerCatalogue(l);
	langue = cat || l === "fr" ? l : "fr";
	textes = cat?.textes ?? {};
	motifs = [];
	for (const [fr, vers] of cat?.motifs ?? []) {
		// « {1} inflige {2} dégâts » → « ^(.-) inflige (.-) dégâts$ »
		const lua = "^" + echapper(fr).gsub("{%d+}", "(.-)")[0] + "$";
		motifs.push({ lua, vers });
	}
	cacheMoteur.clear();
	if (places === undefined) places = relever();
	for (const p of places) p.t[p.k] = textes[p.fr] ?? p.fr;
	for (const f of ecouteurs) task.spawn(f);
}

// ───────────────────────────── Interface ─────────────────────────────

/** Traduit un texte de l'interface (ou un nom du contenu resté en français). */
export function tr(fr: string): string {
	return textes[fr] ?? fr;
}

/** Traduit un texte qui contient des valeurs : trf("Niveau {n} !", { n: 3 }). */
export function trf(fr: string, valeurs: Record<string, unknown>): string {
	let t = textes[fr] ?? fr;
	for (const [k, v] of pairs(valeurs)) t = t.gsub(`{${k}}`, (tostring(v) as string).gsub("%%", "%%%%")[0])[0];
	return t;
}

/** Marque un texte à traduire plus tard (catalogues de shared/) : ne change rien, l'outil d'extraction le repère. */
export function tx(fr: string): string {
	return fr;
}

/** Traduit une phrase fabriquée par le moteur (journal, combat, erreurs…), d'après les modèles de phrases. */
export function trMoteur(s: string): string {
	if (langue === "fr" || s === "") return s;
	const direct = textes[s];
	if (direct !== undefined) return direct;
	const deja = cacheMoteur.get(s);
	if (deja !== undefined) return deja;
	let res = s;
	for (const m of motifs) {
		// roblox-ts range les valeurs renvoyées par string.match dans une liste
		const captures = string.match(s, m.lua);
		if (captures[0] === undefined) continue;
		res = m.vers.gsub("{(%d+)}", (n: string) => {
			const v = tostring(captures[(tonumber(n) ?? 1) - 1] ?? "");
			// une valeur peut être elle-même une phrase du moteur ou un nom
			return trMoteur(v).gsub("%%", "%%%%")[0];
		})[0];
		break;
	}
	cacheMoteur.set(s, res);
	return res;
}
