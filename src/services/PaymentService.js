// Contrato: process(order, subtotal) retorna status, discount e fee.
class PixPayment {
  process(order, subtotal) { return { status: "approved", discount: subtotal * 0.03, fee: 0 }; }
}
class CreditCardPayment {
  process(order, subtotal) {
    return { status: "approved", discount: 0, fee: order.installments > 1 ? subtotal * 0.025 : 0 };
  }
}
class BoletoPayment {
  process() { return { status: "waiting_payment", discount: 0, fee: 0 }; }
}
class PaymentService {
  constructor(processors) { this.processors = new Map(Object.entries(processors)); }
  process(order, subtotal) {
    const processor = this.processors.get(order.paymentMethod);
    if (!processor) throw new Error("Forma de pagamento invalida.");
    return processor.process(order, subtotal);
  }
}
module.exports = { PaymentService, PixPayment, CreditCardPayment, BoletoPayment };
