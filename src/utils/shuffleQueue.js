/**
 * Fisher-Yates unbiased array shuffle
 */
export function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates the initial queue excluding the starting photo so every other photo
 * is shown exactly once before any cycle completes.
 */
export function createInitialQueue(itemsOrTotal, initialIndex) {
  const items = Array.isArray(itemsOrTotal)
    ? [...itemsOrTotal]
    : Array.from({ length: itemsOrTotal }, (_, i) => i);
  const remaining = items.filter(idx => idx !== initialIndex);
  return fisherYatesShuffle(remaining);
}

/**
 * Creates the next randomized cycle of all photos, ensuring that the first 2 slots
 * do not match the photos played at the end of the previous cycle.
 */
export function createNextQueue(itemsOrTotal, recentHistory = []) {
  const allIndices = Array.isArray(itemsOrTotal)
    ? [...itemsOrTotal]
    : Array.from({ length: itemsOrTotal }, (_, i) => i);
  const shuffled = fisherYatesShuffle(allIndices);

  if (allIndices.length <= 2) return shuffled;

  const last1 = recentHistory.length > 0 ? recentHistory[recentHistory.length - 1] : -1;
  const last2 = recentHistory.length > 1 ? recentHistory[recentHistory.length - 2] : -1;

  // Prevent slot 0 from being last1 or last2 (guarantees at least a 2-turn cooldown)
  if (shuffled[0] === last1 || (shuffled.length > 3 && shuffled[0] === last2)) {
    const swapTarget = shuffled.findIndex((val, idx) => idx >= 2 && val !== last1 && val !== last2);
    if (swapTarget !== -1) {
      [shuffled[0], shuffled[swapTarget]] = [shuffled[swapTarget], shuffled[0]];
    } else {
      const fallbackTarget = shuffled.findIndex((val, idx) => idx >= 1 && val !== last1);
      if (fallbackTarget !== -1) {
        [shuffled[0], shuffled[fallbackTarget]] = [shuffled[fallbackTarget], shuffled[0]];
      }
    }
  }

  // Prevent slot 1 from being last1 (guarantees at least a 2-turn cooldown)
  if (shuffled[1] === last1) {
    const swapTarget = shuffled.findIndex((val, idx) => idx >= 2 && val !== last1 && val !== last2);
    if (swapTarget !== -1) {
      [shuffled[1], shuffled[swapTarget]] = [shuffled[swapTarget], shuffled[1]];
    }
  }

  return shuffled;
}

/**
 * PhotoQueueManager:
 * Manages an enqueued randomized playlist where all photos are played once per cycle,
 * the order is re-randomized upon cycle completion, and no photo can repeat within 2 turns.
 */
export class PhotoQueueManager {
  constructor(itemsOrTotal, initialIndex = 0) {
    this.itemsOrTotal = itemsOrTotal;
    this.history = [initialIndex];
    this.queue = createInitialQueue(itemsOrTotal, initialIndex);
  }

  updateItems(newItemsOrTotal) {
    this.itemsOrTotal = newItemsOrTotal;
    const allowed = Array.isArray(newItemsOrTotal) ? new Set(newItemsOrTotal) : null;
    if (allowed) {
      this.queue = this.queue.filter(item => allowed.has(item));
      if (this.queue.length === 0) {
        this.queue = createNextQueue(this.itemsOrTotal, this.history);
      }
    } else {
      this.queue = createNextQueue(this.itemsOrTotal, this.history);
    }
  }

  next() {
    if (this.queue.length === 0) {
      this.queue = createNextQueue(this.itemsOrTotal, this.history);
    }
    const nextIdx = this.queue.shift();
    this.history.push(nextIdx);
    if (this.history.length > 4) {
      this.history.shift();
    }
    return nextIdx;
  }
}
