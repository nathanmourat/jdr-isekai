/**
 * Mode en ligne avec Supabase (base de données gratuite + temps réel).
 * Configuration : variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (voir README).
 * Tables et règles de sécurité : supabase/schema.sql.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Contenu } from '../contenu/charger';
import { nouvellePartie, type Action, type EtatPartie } from '../moteur/partie';
import { genererCode, genererId, type Canal, type InfosPartie } from './types';

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const CLE_SUPABASE = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const enLigneConfigure = () => !!URL_SUPABASE && !!CLE_SUPABASE;

let client: SupabaseClient | null = null;

export async function connexion(): Promise<{ client: SupabaseClient; userId: string }> {
  if (!enLigneConfigure()) throw new Error('Le mode en ligne n\'est pas configuré (voir le README : Supabase).');
  if (CLE_SUPABASE!.startsWith('sb_secret_')) throw new Error('La clé configurée est la « Secret key » de Supabase : elle ne doit jamais être mise dans le jeu. Remplacez-la par la « Publishable key » (sb_publishable_…) dans les variables GitHub, puis supprimez cette clé secrète dans Supabase (Project Settings → API Keys) et créez-en une nouvelle.');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(URL_SUPABASE!)) throw new Error(`L'URL Supabase semble incorrecte (« ${URL_SUPABASE} ») : elle doit ressembler à https://identifiant.supabase.co`);
  client ??= createClient(URL_SUPABASE!, CLE_SUPABASE!);
  const { data } = await client.auth.getSession();
  if (data.session) return { client, userId: data.session.user.id };
  const r = await client.auth.signInAnonymously();
  if (r.error || !r.data.user) throw new Error(`Connexion impossible : ${r.error?.message ?? 'inconnue'}. Les connexions anonymes sont-elles activées dans Supabase ?`);
  return { client, userId: r.data.user.id };
}

interface LignePartie { id: string; code: string; nom: string; depart: EtatPartie; cree_le: string }

const versInfos = (p: LignePartie): InfosPartie => ({ id: p.id, code: p.code, nom: p.nom, mode: 'en-ligne', creeeLe: p.cree_le });

export async function creerPartieEnLigne(contenu: Contenu, nom: string): Promise<InfosPartie> {
  const { client: cl, userId } = await connexion();
  const id = genererId();
  for (let essai = 0; essai < 5; essai++) {
    const code = genererCode();
    const depart = nouvellePartie(contenu, id, nom.trim() || 'Nouvelle partie', `${id}:${Date.now()}`);
    const { error } = await cl.from('parties').insert({ id, code, nom: depart.nom, depart, cree_par: userId });
    if (!error) {
      const m = await cl.from('membres').insert({ partie_id: id, user_id: userId });
      if (m.error) throw new Error(`Création de la partie : ${m.error.message}`);
      return { id, code, nom: depart.nom, mode: 'en-ligne', creeeLe: new Date().toISOString() };
    }
    if (!error.message.includes('duplicate')) throw new Error(`Création de la partie : ${error.message}`);
  }
  throw new Error('Impossible de générer un code de partie libre, réessayez.');
}

export async function rejoindrePartieEnLigne(code: string): Promise<InfosPartie> {
  const { client: cl } = await connexion();
  const { data, error } = await cl.rpc('rejoindre_partie', { code_partie: code.trim().toUpperCase() });
  if (error) throw new Error(error.message.includes('introuvable') ? 'Aucune partie avec ce code.' : `Impossible de rejoindre : ${error.message}`);
  const p = (Array.isArray(data) ? data[0] : data) as LignePartie | null;
  if (!p) throw new Error('Aucune partie avec ce code.');
  return versInfos(p);
}

export async function mesPartiesEnLigne(): Promise<InfosPartie[]> {
  const { client: cl } = await connexion();
  const { data, error } = await cl.from('parties').select('id, code, nom, cree_le').order('cree_le', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as LignePartie[]).map(versInfos);
}

export class CanalSupabase implements Canal {
  private actions: { id: number; action: Action }[] = [];
  private ecouteurs = new Set<(a: Action[]) => void>();
  private abonnement: ReturnType<SupabaseClient['channel']> | null = null;

  private constructor(public readonly infos: InfosPartie, private cl: SupabaseClient, public readonly joueurParDefaut: string) {}

  static async ouvrir(infos: InfosPartie): Promise<CanalSupabase> {
    const { client: cl, userId } = await connexion();
    return new CanalSupabase(infos, cl, userId);
  }

  async charger() {
    const p = await this.cl.from('parties').select('depart').eq('id', this.infos.id).single();
    if (p.error) throw new Error(`Chargement de la partie : ${p.error.message}`);
    this.actions = [];
    let depuis = 0;
    // pagination (1000 lignes maximum par requête)
    for (;;) {
      const { data, error } = await this.cl.from('actions').select('id, action').eq('partie_id', this.infos.id).gt('id', depuis).order('id').limit(1000);
      if (error) throw new Error(`Chargement des actions : ${error.message}`);
      this.actions.push(...(data as { id: number; action: Action }[]));
      if (!data || data.length < 1000) break;
      depuis = data[data.length - 1].id;
    }
    this.abonner();
    return { depart: (p.data as { depart: EtatPartie }).depart, actions: this.actions.map((a) => a.action) };
  }

  private abonner() {
    if (this.abonnement) return;
    this.abonnement = this.cl
      .channel(`partie:${this.infos.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions', filter: `partie_id=eq.${this.infos.id}` }, (payload) => {
        const ligne = payload.new as { id: number; action: Action };
        if (this.actions.some((a) => a.id === ligne.id)) return;
        this.actions.push(ligne);
        this.actions.sort((a, b) => a.id - b.id);
        this.notifier();
      })
      .subscribe();
  }

  private notifier() {
    const a = this.actions.map((x) => x.action);
    for (const cb of this.ecouteurs) cb(a);
  }

  async envoyer(action: Action) {
    const { data, error } = await this.cl.from('actions').insert({ partie_id: this.infos.id, action }).select('id').single();
    if (error) throw new Error(`Envoi impossible : ${error.message}`);
    const id = (data as { id: number }).id;
    if (!this.actions.some((a) => a.id === id)) {
      this.actions.push({ id, action });
      this.actions.sort((a, b) => a.id - b.id);
      this.notifier();
    }
  }

  ecouter(cb: (a: Action[]) => void) {
    this.ecouteurs.add(cb);
    return () => this.ecouteurs.delete(cb);
  }

  fermer() {
    if (this.abonnement) this.cl.removeChannel(this.abonnement);
    this.abonnement = null;
    this.ecouteurs.clear();
  }
}
