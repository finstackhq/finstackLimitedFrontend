import { P2PAd, P2POrder } from './p2p-mock-data';

const MERCHANT_ADS_KEY = 'p2p_merchant_ads';
const ORDERS_KEY = 'p2p_orders';

/**
 * Get all merchant ads from localStorage
 */
export function getMerchantAds(): P2PAd[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(MERCHANT_ADS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading merchant ads from localStorage:', error);
    return [];
  }
}

/**
 * Save a new merchant ad to localStorage (or update if exists)
 */
export function saveMerchantAd(ad: P2PAd): void {
  if (typeof window === 'undefined') return;
  
  try {
    const ads = getMerchantAds();
    const existingIndex = ads.findIndex(a => a.id === ad.id);
    
    if (existingIndex !== -1) {
      // Update existing ad
      ads[existingIndex] = ad;
    } else {
      // Add new ad
      ads.push(ad);
    }
    
    localStorage.setItem(MERCHANT_ADS_KEY, JSON.stringify(ads));
  } catch (error) {
    console.error('Error saving merchant ad to localStorage:', error);
  }
}

/**
 * Update an existing merchant ad in localStorage
 */
export function updateMerchantAd(id: string, updates: Partial<P2PAd>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const ads = getMerchantAds();
    const index = ads.findIndex(ad => ad.id === id);
    
    if (index !== -1) {
      ads[index] = { ...ads[index], ...updates };
      localStorage.setItem(MERCHANT_ADS_KEY, JSON.stringify(ads));
    }
  } catch (error) {
    console.error('Error updating merchant ad in localStorage:', error);
  }
}

/**
 * Delete a merchant ad from localStorage
 */
export function deleteMerchantAd(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const ads = getMerchantAds();
    const filtered = ads.filter(ad => ad.id !== id);
    localStorage.setItem(MERCHANT_ADS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting merchant ad from localStorage:', error);
  }
}

/**
 * Get a single merchant ad by ID
 */
export function getMerchantAdById(id: string): P2PAd | undefined {
  const ads = getMerchantAds();
  return ads.find(ad => ad.id === id);
}

/**
 * Get all merchant ads for a specific merchant
 */
export function getMerchantAdsByMerchantId(merchantId: string): P2PAd[] {
  const ads = getMerchantAds();
  return ads.filter(ad => ad.merchantId === merchantId);
}

/**
 * Toggle ad active status
 */
export function toggleAdStatus(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const ads = getMerchantAds();
    const index = ads.findIndex(ad => ad.id === id);
    
    if (index !== -1) {
      ads[index].isActive = !ads[index].isActive;
      localStorage.setItem(MERCHANT_ADS_KEY, JSON.stringify(ads));
    }
  } catch (error) {
    console.error('Error toggling ad status:', error);
  }
}

/**
 * Bulk update ad statuses
 */
export function bulkUpdateAdStatus(ids: string[], isActive: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const ads = getMerchantAds();
    const updated = ads.map(ad => {
      if (ids.includes(ad.id)) {
        return { ...ad, isActive };
      }
      return ad;
    });
    localStorage.setItem(MERCHANT_ADS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error bulk updating ad statuses:', error);
  }
}

/**
 * Get all orders from localStorage
 */
export function getOrders(): P2POrder[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (!stored) return [];
    
    const orders = JSON.parse(stored);
    // Convert date strings back to Date objects
    return orders.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      expiresAt: new Date(order.expiresAt),
      paidAt: order.paidAt ? new Date(order.paidAt) : undefined,
      releasedAt: order.releasedAt ? new Date(order.releasedAt) : undefined,
      completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
      cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
    }));
  } catch (error) {
    console.error('Error reading orders from localStorage:', error);
    return [];
  }
}

/**
 * Save a new order to localStorage
 */
export function saveOrder(order: P2POrder): void {
  if (typeof window === 'undefined') return;
  
  try {
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving order to localStorage:', error);
  }
}

/**
 * Update an existing order in localStorage
 */
export function updateOrder(id: string, updates: Partial<P2POrder>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const orders = getOrders();
    const index = orders.findIndex(order => order.id === id);
    
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (error) {
    console.error('Error updating order in localStorage:', error);
  }
}

/**
 * Get a single order by ID
 */
export function getOrderById(id: string): P2POrder | undefined {
  const orders = getOrders();
  return orders.find(order => order.id === id);
}

/**
 * Get all orders for a specific buyer
 */
export function getOrdersByBuyerId(buyerId: string): P2POrder[] {
  const orders = getOrders();
  return orders.filter(order => order.buyerId === buyerId);
}

/**
 * Get all orders for a specific merchant
 */
export function getOrdersByMerchantId(merchantId: string): P2POrder[] {
  const orders = getOrders();
  return orders.filter(order => order.merchantId === merchantId);
}

/**
 * Clear all storage (for testing/reset)
 */
export function clearAllP2PStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(MERCHANT_ADS_KEY);
    localStorage.removeItem(ORDERS_KEY);
  } catch (error) {
    console.error('Error clearing P2P storage:', error);
  }
}
