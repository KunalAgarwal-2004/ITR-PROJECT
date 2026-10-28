/**
 * Utility functions for currency, date and label formatting
 *
 * Currency model: the backend stores every amount in USD. The UI shows Indian Rupees by
 * converting at display time with a fixed rate, and converts amounts the user types in
 * rupees back to USD before sending them to the API.
 */
export const USD_TO_INR = Number(import.meta.env?.VITE_USD_TO_INR) || 83;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

// USD amount (as stored by the API) -> rupee amount
export const toINR = (usd) => Math.round((Number(usd) || 0) * USD_TO_INR);

// Rupee amount typed by the user -> USD amount for the API (2 decimal places)
export const toUSD = (inr) => Math.round(((Number(inr) || 0) / USD_TO_INR) * 100) / 100;

// Format a stored USD amount as rupees, e.g. 5000 -> "₹4,15,000"
export const formatCurrency = (usdAmount) => inrFormatter.format(toINR(usdAmount));

// Budget range for a job, e.g. "₹4,15,000 - ₹5,81,000" or "₹5,395/hr"
export const formatBudget = (min, max, isHourly = false) => {
  const suffix = isHourly ? '/hr' : '';
  const hasMin = min != null && min !== '';
  const hasMax = max != null && max !== '';
  if (hasMin && hasMax && Number(min) !== Number(max)) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}${suffix}`;
  }
  if (hasMin || hasMax) {
    return `${formatCurrency(hasMin ? min : max)}${suffix}`;
  }
  return 'Budget not specified';
};

export const formatDate = (dateString) => {
  if (!dateString || Number.isNaN(new Date(dateString).getTime())) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString));
};

// Raw API enum -> readable label, e.g. "in-progress" -> "In Progress", "milestone_review" -> "Milestone Review"
export const formatLabel = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
