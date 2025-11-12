export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 999999.99
}

export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ["USD", "EUR", "GBP", "ZAR"]
  return validCurrencies.includes(currency.toUpperCase())
}
