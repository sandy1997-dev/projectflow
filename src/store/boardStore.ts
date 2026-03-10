import { create } from "zustand";

interface BoardState {
  activeBoardId: string | null;
  activeCardId: string | null;
  activeWorkspaceId: string | null;
  isCardModalOpen: boolean;
  searchQuery: string;
  setActiveBoardId: (id: string | null) => void;
  setActiveCardId: (id: string | null) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  openCardModal: (cardId: string) => void;
  closeCardModal: () => void;
  setSearchQuery: (q: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  activeBoardId: null,
  activeCardId: null,
  activeWorkspaceId: null,
  isCardModalOpen: false,
  searchQuery: "",
  setActiveBoardId: (id) => set({ activeBoardId: id }),
  setActiveCardId: (id) => set({ activeCardId: id }),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  openCardModal: (cardId) => set({ activeCardId: cardId, isCardModalOpen: true }),
  closeCardModal: () => set({ isCardModalOpen: false, activeCardId: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
