export function openPayoneerCheckout(payoneerUrl) {
  if (typeof window === "undefined") return false;
  if (!payoneerUrl) throw new Error("Payoneer checkout URL is not configured for this service");
  window.open(payoneerUrl, "_blank", "noopener,noreferrer");
  return true;
}
