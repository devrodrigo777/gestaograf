export function formatCurrency(value: number | string): string {
  let stringValue = String(value);

  // Remove non-digit characters
  stringValue = stringValue.replace(/\D/g, '');

  if (stringValue === '' || isNaN(Number(stringValue))) {
    return '';
  }

  // Convert to a number, divide by 100
  const numberValue = Number(stringValue) / 100;

  // Format to BRL currency
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function parseCurrency(value: string): number {
  if (!value) {
    return 0;
  }
  // Remove R$, dots, and replace comma with a dot
  const numberString = value
    .replace('R$', '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(numberString) || 0;
}

export function formatCurrencyForChart(value: number): string {
  if (typeof value !== 'number') return '';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
