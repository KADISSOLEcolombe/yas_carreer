'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface FavorisContextType {
  favorisIds: Set<number>;
  isFavori: (id_offre: number) => boolean;
  toggleFavori: (id_offre: number) => Promise<void>;
}

const FavorisContext = createContext<FavorisContextType | undefined>(undefined);

export function FavorisProvider({ children }: { children: React.ReactNode }) {
  const { user, isCandidate } = useAuth();
  const router = useRouter();
  const [favorisIds, setFavorisIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (!isCandidate) {
        setFavorisIds(new Set());
        return;
      }
      try {
        const favoris = await api.getFavoris();
        setFavorisIds(new Set(favoris.map((f) => f.id_offre)));
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };

    load();
  }, [isCandidate, user?.id]);

  const isFavori = useCallback((id_offre: number) => favorisIds.has(id_offre), [favorisIds]);

  const toggleFavori = useCallback(
    async (id_offre: number) => {
      if (!isCandidate) {
        router.push('/register?message=favoris_required');
        return;
      }

      const dejaFavori = favorisIds.has(id_offre);

      try {
        if (dejaFavori) {
          await api.removeFavori(id_offre);
        } else {
          await api.addFavori(id_offre);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des favoris:', error);
        return;
      }

      setFavorisIds((prev) => {
        const next = new Set(prev);
        if (dejaFavori) next.delete(id_offre);
        else next.add(id_offre);
        return next;
      });
    },
    [favorisIds, isCandidate, router]
  );

  return (
    <FavorisContext.Provider value={{ favorisIds, isFavori, toggleFavori }}>
      {children}
    </FavorisContext.Provider>
  );
}

export function useFavoris() {
  const context = useContext(FavorisContext);
  if (context === undefined) {
    throw new Error('useFavoris must be used within a FavorisProvider');
  }
  return context;
}
