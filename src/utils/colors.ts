export const AppColors = {
  primary: '#1B4B43', // Deep teal (nav, headers)
  accent: '#E3A008', // Warm mustard (primary actions, e.g. "New Bill", "Save")
  background: '#F6F5F1', // Warm off-white
  surface: '#FFFFFF', // White
  textPrimary: '#22262B', // Charcoal
  textSecondary: '#6B7078', // Muted grey
  success: '#2E7D4F', // Forest green
  warning: '#E3A008', // Mustard
  danger: '#B3491F', // Muted rust
  border: '#E3E0D8', // Borders/dividers

  // Section Accent Tints for squircle icon backgrounds
  sections: {
    billing: '#E2EFEA', // Deep teal tint
    inventory: '#FEF4DC', // Warm mustard tint
    loans: '#ECEFF8', // Indigo slate tint
    expenses: '#FDE8E1', // Rust tint
    partnership: '#F0EBF8', // Violet tint
    reports: '#E5F4EB', // Emerald tint
    settings: '#EFEFEF', // Neutral tint
  },
} as const;

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs ${formatted}`;
}

export function formatQuantity(qty: number, unit = 'pcs'): string {
  return `${qty} ${unit}`;
}
