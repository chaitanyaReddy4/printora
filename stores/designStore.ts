"use client";

import { create } from "zustand";

export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape" | "clipart";
  fabricObjectId?: string;
}

interface DesignStore {
  canvasJson: string | null;
  previewUrl: string | null;
  savedDesignUrl: string | null;
  currentProductSlug: string | null;
  printSide: "front" | "back";
  undoStack: string[];
  redoStack: string[];
  setCanvasJson: (json: string) => void;
  setPreviewUrl: (url: string) => void;
  setSavedDesignUrl: (url: string) => void;
  setCurrentProduct: (slug: string) => void;
  setPrintSide: (side: "front" | "back") => void;
  pushUndo: (json: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  reset: () => void;
}

export const useDesignStore = create<DesignStore>()((set, get) => ({
  canvasJson: null,
  previewUrl: null,
  savedDesignUrl: null,
  currentProductSlug: null,
  printSide: "front",
  undoStack: [],
  redoStack: [],

  setCanvasJson: (json) => set({ canvasJson: json }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setSavedDesignUrl: (url) => set({ savedDesignUrl: url }),
  setCurrentProduct: (slug) => set({ currentProductSlug: slug }),
  setPrintSide: (side) => set({ printSide: side }),

  pushUndo: (json) => {
    const { undoStack } = get();
    const newStack = [...undoStack, json].slice(-20); // keep last 20
    set({ undoStack: newStack, redoStack: [] });
  },

  undo: () => {
    const { undoStack, canvasJson } = get();
    if (undoStack.length === 0) return null;
    const newStack = [...undoStack];
    const previous = newStack.pop()!;
    set((state) => ({
      undoStack: newStack,
      redoStack: canvasJson ? [...state.redoStack, canvasJson] : state.redoStack,
      canvasJson: previous,
    }));
    return previous;
  },

  redo: () => {
    const { redoStack, canvasJson } = get();
    if (redoStack.length === 0) return null;
    const newStack = [...redoStack];
    const next = newStack.pop()!;
    set((state) => ({
      redoStack: newStack,
      undoStack: canvasJson ? [...state.undoStack, canvasJson] : state.undoStack,
      canvasJson: next,
    }));
    return next;
  },

  reset: () =>
    set({
      canvasJson: null,
      previewUrl: null,
      savedDesignUrl: null,
      undoStack: [],
      redoStack: [],
    }),
}));
