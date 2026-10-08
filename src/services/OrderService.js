class OrderService {
  constructor({ validator, inventory, discounts, freight, payments,
    orderRepository, notification, logger, presenter }) {
    this.validator = validator;
    this.inventory = inventory;
    this.discounts = discounts;
    this.freight = freight;
    this.payments = payments;
    this.orderRepository = orderRepository;
    this.notification = notification;
    this.logger = logger;
    this.presenter = presenter;
  }
  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);
    this.validator.validate(order);
    // Cada item e validado antes de passar ao proximo, como no original.
    for (const item of order.items) {
      this.validator.validateItem(item);
      this.inventory.validate([item]);
    }
    const subtotal = order.getSubtotal();
    const baseDiscount = this.discounts.calculate(order, subtotal);
    const freight = this.freight.calculate(order);
    const payment = this.payments.process(order, subtotal);
    const discount = baseDiscount + payment.discount;
    const total = Number((subtotal - discount + freight + payment.fee).toFixed(2));
    if (total <= 0) throw new Error("Total do pedido invalido.");
    this.inventory.decrease(order.items);
    order.setPaymentStatus(payment.status);
    const summary = order.toSummary({ subtotal, discount: Number(discount.toFixed(2)),
      freight: Number(freight.toFixed(2)), paymentFee: Number(payment.fee.toFixed(2)), total });
    this.orderRepository.save(summary);
    if (summary.status === "confirmed") {
      this.notification.sendOrderConfirmation(order.getContact(), order.id, total);
    } else {
      this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }
    this.presenter.show(summary, order.getTotalItems());
    return summary;
  }
}
module.exports = OrderService;
