class OrderPresenter {
  constructor(output) { this.output = output; }
  show(summary, totalItems) {
    this.output.log("Resumo do pedido");
    this.output.log(`Cliente: ${summary.customerName}`);
    this.output.log(`Cidade: ${summary.city}/${summary.state}`);
    this.output.log(`Itens: ${totalItems}`);
    this.output.log(`Subtotal: R$ ${summary.subtotal.toFixed(2)}`);
    this.output.log(`Desconto: R$ ${summary.discount.toFixed(2)}`);
    this.output.log(`Frete: R$ ${summary.freight.toFixed(2)}`);
    this.output.log(`Taxas: R$ ${summary.paymentFee.toFixed(2)}`);
    this.output.log(`Total: R$ ${summary.total.toFixed(2)}`);
  }
}
module.exports = OrderPresenter;
