import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal ke format Indonesia (dd MMMM yyyy)
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return format(date, 'dd MMMM yyyy', { locale: id });
};

/**
 * Format tanggal dan waktu ke format Indonesia (dd MMMM yyyy HH:mm)
 */
export const formatDateTime = (dateString: string | Date | number): string => {
  let date: Date;
  if (typeof dateString === 'number') {
    date = new Date(dateString * 1000); // Convert UNIX timestamp to Date
  } else {
    date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  }
  return format(date, 'dd MMMM yyyy HH:mm', { locale: id });
};

/**
 * Format time slot dari angka ke format jam (00:00)
 */
export const formatTimeSlot = (slot: number) => {
  const hour = Math.floor(slot / 2);
  const minute = slot % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
};

/**
 * Format array slot waktu menjadi rentang waktu yang mudah dibaca
 */
export const formatSlots = (slots: number[]) => {
  if (!slots || slots.length === 0) return "-";
  
  // Sort slots numerically
  const sortedSlots = [...slots].sort((a, b) => a - b);
  
  // Group consecutive slots
  const groups: number[][] = [];
  let currentGroup: number[] = [sortedSlots[0]];
  
  for (let i = 1; i < sortedSlots.length; i++) {
    if (sortedSlots[i] === sortedSlots[i - 1] + 1) {
      currentGroup.push(sortedSlots[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sortedSlots[i]];
    }
  }
  
  groups.push(currentGroup);
  
  // Format each group
  return groups.map(group => {
    if (group.length === 1) {
      return formatTimeSlot(group[0]);
    } else {
      return `${formatTimeSlot(group[0])} - ${formatTimeSlot(group[group.length - 1] + 1)}`;
    }
  }).join(", ");
};

/**
 * Format currency ke format Rupiah (IDR)
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
