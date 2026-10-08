// Simulacao no console; nao envia e-mails reais.
class NotificationService {
  constructor(output) { this.output = output; }
  sendOrderConfirmation(contact, orderId, total) {
    this.output.log(`Confirmacao para ${contact.email}: pedido ${orderId}, total R$ ${total.toFixed(2)}.`);
  }
}
module.exports = NotificationService;
