import { create } from 'zustand';

export interface DigitalObject {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  issuer: string;
  issuerName?: string;
  issuerVerified?: boolean;
  utility?: string;
  tokenId?: string;
  transferable?: boolean;
  createdAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  objectIds: string[];
}

interface ObjectsState {
  objects: DigitalObject[];
  collections: Collection[];
  activeFilter: string;
  selectedObjectId: string | null;
  // Actions
  setObjects: (objects: DigitalObject[]) => void;
  setFilter: (filter: string) => void;
  selectObject: (id: string) => void;
  clearSelection: () => void;
}

export const useObjectsStore = create<ObjectsState>((set) => ({
  objects: [],
  collections: [],
  activeFilter: 'All',
  selectedObjectId: null,
  setObjects: (objects) => set({ objects }),
  setFilter: (activeFilter) => set({ activeFilter }),
  selectObject: (id) => set({ selectedObjectId: id }),
  clearSelection: () => set({ selectedObjectId: null }),
}));
