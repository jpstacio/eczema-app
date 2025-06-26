// utils/formatting.ts

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFrequency(frequency: string | null | undefined): string {
  if (!frequency) return 'Not specified';

  const normalized = frequency.trim().toLowerCase();

  switch (normalized) {
    case 'daily':
      return 'Daily';
    case 'twice daily':
      return 'Twice Daily';
    case 'weekly':
      return 'Weekly';
    case 'as needed':
      return 'As Needed';
    default:
      return frequency;
  }
}
