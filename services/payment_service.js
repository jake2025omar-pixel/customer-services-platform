export function openPayoneerCheckout(url) {
  if (typeof window === "undefined") return false;
  if (!url) throw new Error("Payoneer checkout URL is not configured for this service");
  window.open(url, "_blank");
  return true;
}
