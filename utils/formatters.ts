export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatAmount(amount: string): string {
  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(numAmount);
} 