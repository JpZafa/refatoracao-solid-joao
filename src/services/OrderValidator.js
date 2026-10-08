class OrderValidator {
  validate(order) {
    if (!order.hasCustomer()) throw new Error("Cliente obrigatorio.");
    if (!order.hasValidCustomerEmail()) throw new Error("E-mail do cliente invalido.");
    if (!order.items || order.items.length === 0) throw new Error("Pedido sem itens.");
  }
  validateItem(item) {
    if (!item.hasProduct()) throw new Error("Item sem produto.");
    if (item.quantity <= 0) throw new Error("Quantidade invalida.");
  }
}
module.exports = OrderValidator;
