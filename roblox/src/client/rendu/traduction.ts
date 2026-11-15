/**
 * Textes posés dans le monde 3D par le serveur (en français) : invites « E » (ProximityPrompt), bulles et étiquettes
 * au-dessus des têtes (BillboardGui). Chaque joueur les traduit chez lui, dans sa langue ; le français d'origine est
 * gardé dans un attribut local pour pouvoir changer de langue.
 */
import { Workspace } from "@rbxts/services";
import { surChangementLangue, trMoteur } from "shared/langue";

type Cible = { o: Instance; prop: "Text" | "ActionText" | "ObjectText" };
const suivis: Cible[] = [];

function lire(c: Cible): string {
	return (c.o as unknown as Record<string, string>)[c.prop];
}
function ecrire(c: Cible, v: string) {
	(c.o as unknown as Record<string, string>)[c.prop] = v;
}

function traduire(c: Cible) {
	const fr = c.o.GetAttribute(`Fr${c.prop}`);
	if (!typeIs(fr, "string")) return;
	const t = trMoteur(fr);
	c.o.SetAttribute(`Tr${c.prop}`, t);
	if (lire(c) !== t) ecrire(c, t);
}

function suivre(o: Instance, prop: Cible["prop"]) {
	const c: Cible = { o, prop };
	o.SetAttribute(`Fr${prop}`, lire(c));
	suivis.push(c);
	traduire(c);
	// le serveur change le texte (nouvelle bulle) : c'est un nouveau texte français
	o.GetPropertyChangedSignal(prop as never).Connect(() => {
		if (lire(c) === o.GetAttribute(`Tr${prop}`)) return;
		o.SetAttribute(`Fr${prop}`, lire(c));
		traduire(c);
	});
	o.Destroying.Connect(() => {
		const i = suivis.indexOf(c);
		if (i >= 0) suivis.remove(i);
	});
}

function examiner(o: Instance) {
	if (o.IsA("ProximityPrompt")) {
		suivre(o, "ActionText");
		suivre(o, "ObjectText");
	} else if ((o.IsA("TextLabel") || o.IsA("TextButton")) && o.FindFirstAncestorOfClass("BillboardGui")) suivre(o, "Text");
}

export function traduireLeMonde() {
	for (const o of Workspace.GetDescendants()) examiner(o);
	Workspace.DescendantAdded.Connect(examiner);
	surChangementLangue(() => {
		for (const c of [...suivis]) if (c.o.Parent) traduire(c);
	});
}
