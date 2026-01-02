export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return `$ ${Math.round(value / 1000000)}M`;
  }
  if (absValue >= 10000) {
    return `$ ${Math.round(value / 1000)}K`;
  }
  return `$ ${Math.floor(value).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatTokenAmount(value: number): string {
  return `${Math.floor(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} TOKENS`;
}

export function formatPrice(value: number): string {
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
