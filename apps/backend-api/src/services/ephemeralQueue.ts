export interface EphemeralQueueItem {
  id: string;
  operatorId: string;
  customerName: string;
  customerPhone?: string;
  extractedProfile: Record<string, any>;
  extractedFields: any[];
  rawText?: string;
  createdAt: number;
}

class EphemeralQueueManager {
  // In-memory RAM storage only - zero database persistence for privacy
  private queue = new Map<string, EphemeralQueueItem>();

  constructor() {
    // Periodically clean up unconsumed queue items older than 15 minutes
    setInterval(() => this.cleanupExpiredItems(), 5 * 60 * 1000);
  }

  public addItem(item: Omit<EphemeralQueueItem, 'id' | 'createdAt'>): EphemeralQueueItem {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: EphemeralQueueItem = {
      ...item,
      id,
      createdAt: Date.now()
    };
    this.queue.set(id, newItem);
    console.log(`[EphemeralQueue] Added temporary item ${id} for operator ${item.operatorId} (${item.customerName})`);
    return newItem;
  }

  public getPendingForOperator(operatorId: string): Omit<EphemeralQueueItem, 'extractedProfile' | 'extractedFields' | 'rawText'>[] {
    const list: Omit<EphemeralQueueItem, 'extractedProfile' | 'extractedFields' | 'rawText'>[] = [];
    for (const item of this.queue.values()) {
      if (item.operatorId === operatorId) {
        list.push({
          id: item.id,
          operatorId: item.operatorId,
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          createdAt: item.createdAt
        });
      }
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  public consumeItem(id: string, operatorId: string): EphemeralQueueItem | null {
    const item = this.queue.get(id);
    if (!item) return null;
    if (item.operatorId !== operatorId && operatorId !== 'admin') return null;

    // Immediately delete from memory upon retrieval for 100% privacy
    this.queue.delete(id);
    console.log(`[EphemeralQueue] Consumed and deleted item ${id} for operator ${operatorId}`);
    return item;
  }

  private cleanupExpiredItems(): void {
    const NOW = Date.now();
    const MAX_AGE = 15 * 60 * 1000; // 15 minutes TTL

    for (const [id, item] of this.queue.entries()) {
      if (NOW - item.createdAt > MAX_AGE) {
        this.queue.delete(id);
        console.log(`[EphemeralQueue] Auto-expired unconsumed item ${id}`);
      }
    }
  }
}

export const ephemeralQueueManager = new EphemeralQueueManager();
