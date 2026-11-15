/**
 * Inviter un joueur en s'approchant de lui : chaque joueur pose chez lui une invite « Inviter dans le groupe »
 * (touche G) sur les autres avatars. Elle n'est active que si l'invitation est possible.
 */
import { Players } from "@rbxts/services";
import { commandeGroupe, jeu } from "../partie";

const invites = new Map<Player, ProximityPrompt>();

function poser(p: Player, perso: Model) {
	const racine = perso.WaitForChild("HumanoidRootPart", 10) as BasePart | undefined;
	if (!racine) return;
	invites.get(p)?.Destroy();
	const i = new Instance("ProximityPrompt");
	i.Name = "InviterGroupe";
	i.ActionText = "Inviter dans le groupe";
	i.ObjectText = p.DisplayName;
	i.KeyboardKeyCode = Enum.KeyCode.G;
	i.HoldDuration = 0.3;
	i.MaxActivationDistance = 10;
	i.RequiresLineOfSight = false;
	i.Triggered.Connect(() => commandeGroupe({ type: "inviter", cible: p.UserId }));
	i.Parent = racine;
	invites.set(p, i);
	majInvitesJoueurs();
}

function brancher(p: Player) {
	if (p === Players.LocalPlayer) return;
	if (p.Character) task.spawn(poser, p, p.Character);
	p.CharacterAdded.Connect((perso) => poser(p, perso));
}

export function preparerInvitesJoueurs() {
	Players.GetPlayers().forEach(brancher);
	Players.PlayerAdded.Connect(brancher);
	Players.PlayerRemoving.Connect((p) => invites.delete(p));
}

/** Active les invites seulement quand on peut inviter (héros créé, seul ou chef, groupe pas complet, cible libre). */
export function majInvitesJoueurs() {
	const g = jeu.groupe;
	const moi = Players.LocalPlayer.UserId;
	const chef = g?.membres?.[0];
	const peut = g?.pret === true && (chef === undefined || chef === moi) && (g?.membres?.size() ?? 1) < 6;
	for (const [p, i] of invites) i.Enabled = peut && !(g?.occupes.includes(p.UserId) ?? false);
}
