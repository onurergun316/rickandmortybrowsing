import { apiClient } from "./apiClient";
import type { ApiResponse } from "../models/ApiResponse";
import type { Character } from "../models/Character";

export const rickAndMortyService = {
  getCharacters(page: number, signal?: AbortSignal) {
    return apiClient.get<ApiResponse<Character>>(`/character/?page=${page}`, signal);
  },
};