/** WhatsApp chat link to a customer's own number (e.g. "+919876543210"), pre-filled with a message. */
export function waToCustomer(mobile: string, message: string) {
  return `https://wa.me/${mobile.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
