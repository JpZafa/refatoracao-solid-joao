const ProductRepository = require("./repositories/ProductRepository");
const OrderRepository = require("./repositories/OrderRepository");
const Logger = require("./utils/Logger");
const OrderService = require("./services/OrderService");
const OrderValidator = require("./services/OrderValidator");
const InventoryService = require("./services/InventoryService");
const FreightCalculator = require("./services/FreightCalculator");
const NotificationService = require("./services/NotificationService");
const OrderPresenter = require("./services/OrderPresenter");
const { DiscountCalculator, CustomerDiscount, CouponDiscount, HighValueDiscount } = require("./services/DiscountCalculator");
const { PaymentService, PixPayment, CreditCardPayment, BoletoPayment } = require("./services/PaymentService");
// As dependencias concretas sao montadas fora do servico de pedidos.
function createApplication(options = {}) {
  const output = options.output || console;
  const productRepository = options.productRepository || new ProductRepository();
  const orderRepository = options.orderRepository || new OrderRepository();
  const logger = options.logger || new Logger(output);
  const orderService = new OrderService({
    validator: options.validator || new OrderValidator(),
    inventory: options.inventory || new InventoryService(productRepository),
    discounts: options.discounts || new DiscountCalculator([
      new CustomerDiscount("vip", 0.08), new CustomerDiscount("employee", 0.15),
      new CouponDiscount("TECH10", 0.1), new HighValueDiscount()
    ]),
    freight: options.freight || new FreightCalculator({
      sudeste: { base: 20, perKg: 4 }, sul: { base: 28, perKg: 5 },
      "centro-oeste": { base: 35, perKg: 6 }, nordeste: { base: 45, perKg: 7 },
      norte: { base: 60, perKg: 9 }
    }, { base: 50, perKg: 8 }),
    payments: options.payments || new PaymentService({
      pix: new PixPayment(), credit_card: new CreditCardPayment(), boleto: new BoletoPayment()
    }),
    orderRepository, notification: options.notification || new NotificationService(output),
    logger, presenter: options.presenter || new OrderPresenter(output)
  });
  return { orderService, productRepository, orderRepository };
}
module.exports = createApplication;
