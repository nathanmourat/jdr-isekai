/**
 * Petites animations du décor, calculées par chaque joueur chez lui (rien ne passe par le serveur) :
 * les ailes des moulins à vent (modèles étiquetés « AilesMoulin » par server/paysage.ts) tournent lentement.
 * Seuls les moulins à moins de 600 studs de la caméra sont animés.
 */
import { CollectionService, RunService, Workspace } from "@rbxts/services";

const VITESSE = 0.8; // radians par seconde

export function animerDecor() {
	RunService.RenderStepped.Connect((dt) => {
		const camera = Workspace.CurrentCamera;
		if (!camera) return;
		for (const m of CollectionService.GetTagged("AilesMoulin")) {
			if (!m.IsA("Model")) continue;
			const pivot = m.GetPivot();
			if (pivot.Position.sub(camera.CFrame.Position).Magnitude > 600) continue;
			m.PivotTo(pivot.mul(CFrame.Angles(0, 0, dt * VITESSE)));
		}
	});
}
