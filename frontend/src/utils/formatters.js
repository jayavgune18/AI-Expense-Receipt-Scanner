export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || '0';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
};

export const getCategoryColor = (categoryName) => {
  const colors = {
    'Food & Dining': '#EF4444',
    'Transport': '#F59E0B',
    'Shopping': '#EC4899',
    'Healthcare': '#10B981',
    'Education': '#3B82F6',
    'Entertainment': '#8B5CF6',
    'Travel': '#06B6D4',
    'Utilities': '#F97316',
    'Others': '#6B7280',
  };
  return colors[categoryName] || '#6B7280';
};

export const getCategoryIcon = (categoryName) => {
  const icons = {
    'Food & Dining': '🍽️',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Healthcare': '🏥',
    'Education': '📚',
    'Entertainment': '🎬',
    'Travel': '✈️',
    'Utilities': '💡',
    'Others': '📦',
  };
  return icons[categoryName] || '📦';
};