/**
 * Réglages des joueurs (langue, volumes, affichage) : gardés sur leur compte, DataStore « VelmarisReglages_v1 ».
 * Le joueur les reçoit à son arrivée ; ses changements sont enregistrés quelques secondes après (pas à chaque clic).
 */
import { DataStoreService, Players } from "@rbxts/services";
import { nettoyerReglages, type Reglages } from "shared/reglages";
import { reseau } from "shared/reseau";

const r = reseau();
let store: DataStore | undefined;
{
	const [ok] = pcall(() => {
		store = DataStoreService.GetDataStore("VelmarisReglages_v1");
		store.GetAsync("test");
	});
	if (!ok) store = undefined;
}
const memoire = new Map<number, Reglages>();
const enAttente = new Map<Player, Reglages>();

function enregistrer(p: Player) {
	const reg = enAttente.get(p);
	if (!reg) return;
	enAttente.delete(p);
	if (!store) {
		memoire.set(p.UserId, reg);
		return;
	}
	const [ok, err] = pcall(() => store!.SetAsync(`u${p.UserId}`, reg));
	if (!ok) warn(`[Velmaris] Réglages de ${p.Name} : ${tostring(err)}`);
}

function arrivee(p: Player) {
	task.spawn(() => {
		let brut: unknown = memoire.get(p.UserId);
		if (store) {
			const [ok, d] = pcall(() => store!.GetAsync(`u${p.UserId}`)[0]);
			if (ok) brut = d;
		}
		// rien d'enregistré : le joueur garde ses réglages par défaut (et la langue de son compte)
		r.reglages.FireClient(p, brut !== undefined ? nettoyerReglages(brut) : undefined);
	});
}

export function preparerReglages() {
	r.reglages.OnServerEvent.Connect((p, brut) => {
		const deja = enAttente.has(p);
		enAttente.set(p, nettoyerReglages(brut));
		if (!deja) task.delay(4, () => enregistrer(p));
	});
	Players.PlayerAdded.Connect(arrivee);
	for (const p of Players.GetPlayers()) arrivee(p);
	Players.PlayerRemoving.Connect((p) => enregistrer(p));
}
