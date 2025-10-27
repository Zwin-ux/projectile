/**
 * Stage Storage System
 * Handles saving, loading, and sharing custom stages via localStorage and JSON export/import
 */

import type { CustomStage, StageLibraryEntry } from '@/types/customStage';
import { DEFAULT_CUSTOM_STAGE } from '@/types/customStage';

const STORAGE_KEY = 'parabola_custom_stages';
const FEATURED_STAGES_KEY = 'parabola_featured_stages';

/**
 * Get all custom stages from localStorage
 */
export function getAllStages(): CustomStage[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as CustomStage[];
  } catch (error) {
    console.error('Error loading stages:', error);
    return [];
  }
}

/**
 * Get a single stage by ID
 */
export function getStageById(id: string): CustomStage | null {
  const stages = getAllStages();
  return stages.find(s => s.id === id) || null;
}

/**
 * Save a new custom stage
 */
export function saveStage(stage: Omit<CustomStage, 'id' | 'created' | 'lastModified'>): CustomStage {
  const stages = getAllStages();

  const newStage: CustomStage = {
    ...stage,
    id: generateStageId(),
    created: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };

  stages.push(newStage);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));

  return newStage;
}

/**
 * Update an existing stage
 */
export function updateStage(id: string, updates: Partial<Omit<CustomStage, 'id' | 'created'>>): CustomStage | null {
  const stages = getAllStages();
  const index = stages.findIndex(s => s.id === id);

  if (index === -1) return null;

  stages[index] = {
    ...stages[index],
    ...updates,
    lastModified: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
  return stages[index];
}

/**
 * Delete a stage
 */
export function deleteStage(id: string): boolean {
  const stages = getAllStages();
  const filtered = stages.filter(s => s.id !== id);

  if (filtered.length === stages.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Duplicate a stage
 */
export function duplicateStage(id: string): CustomStage | null {
  const original = getStageById(id);
  if (!original) return null;

  const duplicate = {
    ...original,
    name: `${original.name} (Copy)`,
    creator: original.creator
  };

  delete (duplicate as any).id;
  delete (duplicate as any).created;
  delete (duplicate as any).lastModified;

  return saveStage(duplicate);
}

/**
 * Export stage as JSON string
 */
export function exportStageAsJSON(id: string): string | null {
  const stage = getStageById(id);
  if (!stage) return null;

  return JSON.stringify(stage, null, 2);
}

/**
 * Import stage from JSON string
 */
export function importStageFromJSON(jsonString: string): CustomStage | null {
  try {
    const parsed = JSON.parse(jsonString) as CustomStage;

    // Validate required fields
    if (!parsed.name || !parsed.targets || !parsed.environment) {
      throw new Error('Invalid stage format');
    }

    // Remove ID so it gets a new one
    const stageData = { ...parsed };
    delete (stageData as any).id;
    delete (stageData as any).created;
    delete (stageData as any).lastModified;

    // Add "(Imported)" to name
    stageData.name = `${stageData.name} (Imported)`;

    return saveStage(stageData);
  } catch (error) {
    console.error('Error importing stage:', error);
    return null;
  }
}

/**
 * Export stage as shareable code (compressed)
 */
export function generateShareCode(id: string): string | null {
  const json = exportStageAsJSON(id);
  if (!json) return null;

  try {
    // Base64 encode for sharing
    return btoa(json);
  } catch (error) {
    console.error('Error generating share code:', error);
    return null;
  }
}

/**
 * Import stage from share code
 */
export function importFromShareCode(code: string): CustomStage | null {
  try {
    const json = atob(code);
    return importStageFromJSON(json);
  } catch (error) {
    console.error('Error importing from share code:', error);
    return null;
  }
}

/**
 * Get library entries (metadata only) for browsing
 */
export function getStageLibrary(): StageLibraryEntry[] {
  const stages = getAllStages();

  return stages.map(stage => ({
    id: stage.id,
    name: stage.name,
    creator: stage.creator,
    difficulty: stage.difficulty,
    parScore: stage.parScore,
    thumbnail: stage.thumbnail,
    plays: stage.plays,
    averageScore: stage.averageScore,
    tags: stage.tags,
    isFeatured: false,
    isOfficial: false
  }));
}

/**
 * Update stage stats after playing
 */
export function updateStageStats(id: string, score: number): void {
  const stage = getStageById(id);
  if (!stage) return;

  const newPlays = stage.plays + 1;
  const newAverageScore = ((stage.averageScore * stage.plays) + score) / newPlays;

  updateStage(id, {
    plays: newPlays,
    averageScore: Math.round(newAverageScore)
  });
}

/**
 * Create a new empty stage
 */
export function createNewStage(name?: string): CustomStage {
  return saveStage({
    ...DEFAULT_CUSTOM_STAGE,
    name: name || 'Untitled Stage',
    creator: 'You'
  });
}

/**
 * Generate unique stage ID
 */
function generateStageId(): string {
  return `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get official/featured stages (predefined challenges)
 */
export function getOfficialStages(): CustomStage[] {
  // TODO: Load from API or static JSON file
  // For now, return empty array
  return [];
}

/**
 * Search stages by name or tags
 */
export function searchStages(query: string): StageLibraryEntry[] {
  const library = getStageLibrary();
  const lowerQuery = query.toLowerCase();

  return library.filter(stage =>
    stage.name.toLowerCase().includes(lowerQuery) ||
    stage.creator.toLowerCase().includes(lowerQuery) ||
    stage.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Sort stages by criteria
 */
export function sortStages(
  stages: StageLibraryEntry[],
  sortBy: 'name' | 'difficulty' | 'plays' | 'newest'
): StageLibraryEntry[] {
  const sorted = [...stages];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'difficulty':
      return sorted.sort((a, b) => a.difficulty - b.difficulty);
    case 'plays':
      return sorted.sort((a, b) => b.plays - a.plays);
    case 'newest':
      // IDs contain timestamps
      return sorted.sort((a, b) => b.id.localeCompare(a.id));
    default:
      return sorted;
  }
}

/**
 * Clear all custom stages (use with caution!)
 */
export function clearAllStages(): void {
  if (confirm('Are you sure you want to delete ALL custom stages? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
  }
}
