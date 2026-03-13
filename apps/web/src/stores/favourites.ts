import { create } from 'zustand';

interface FavouritesState {
  favouriteIds: Set<string>;
  loading: boolean;
  loaded: boolean;
}

interface FavouritesActions {
  loadFavourites: () => Promise<void>;
  toggleFavourite: (activityId: string) => Promise<void>;
  isFavourite: (activityId: string) => boolean;
}

export const useFavouritesStore = create<FavouritesState & FavouritesActions>()(
  (set, get) => ({
    favouriteIds: new Set<string>(),
    loading: false,
    loaded: false,

    loadFavourites: async () => {
      // Skip if already loaded
      if (get().loaded) return;

      set({ loading: true });
      try {
        const res = await fetch('/api/favourites');
        if (res.ok) {
          const data = await res.json();
          set({
            favouriteIds: new Set<string>(data.activityIds || []),
            loaded: true,
          });
        }
      } catch (error) {
        console.error('Failed to load favourites:', error);
      } finally {
        set({ loading: false });
      }
    },

    toggleFavourite: async (activityId: string) => {
      const { favouriteIds } = get();
      const isFav = favouriteIds.has(activityId);

      // Optimistic update
      const newIds = new Set(favouriteIds);
      if (isFav) {
        newIds.delete(activityId);
      } else {
        newIds.add(activityId);
      }
      set({ favouriteIds: newIds });

      try {
        const res = await fetch('/api/favourites', {
          method: isFav ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activity_id: activityId }),
        });

        if (!res.ok) {
          // Revert on failure
          const revertIds = new Set(newIds);
          if (isFav) {
            revertIds.add(activityId);
          } else {
            revertIds.delete(activityId);
          }
          set({ favouriteIds: revertIds });
        }
      } catch {
        // Revert on error
        const revertIds = new Set(newIds);
        if (isFav) {
          revertIds.add(activityId);
        } else {
          revertIds.delete(activityId);
        }
        set({ favouriteIds: revertIds });
      }
    },

    isFavourite: (activityId: string) => {
      return get().favouriteIds.has(activityId);
    },
  })
);
