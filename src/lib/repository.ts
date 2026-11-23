import { GAMES } from "@/data/games";
import type { BookingRequest, Game, RequestStatus } from "./types";

/**
 * Couche d'accès aux données. Aujourd'hui : données locales + localStorage.
 * Demain : remplacer l'implémentation par des appels API / base de données
 * (Postgres, Supabase…) sans toucher aux composants.
 */
export interface Repository {
  listGames(): Promise<Game[]>;
  listRequests(): Promise<BookingRequest[]>;
  saveRequest(r: BookingRequest): Promise<void>;
  updateRequestStatus(id: string, status: RequestStatus): Promise<void>;
}

const KEY = "pixeldock.requests.v1";

function read(): BookingRequest[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as BookingRequest[];
  } catch {
    return [];
  }
}
function write(list: BookingRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* stockage indisponible */
  }
}

export const localRepository: Repository = {
  async listGames() {
    return GAMES;
  },
  async listRequests() {
    return read();
  },
  async saveRequest(r) {
    write([r, ...read()]);
  },
  async updateRequestStatus(id, status) {
    write(read().map((r) => (r.id === id ? { ...r, status } : r)));
  },
};
