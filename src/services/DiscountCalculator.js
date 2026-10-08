class CustomerDiscount {
  constructor(type, rate) { this.type = type; this.rate = rate; }
  calculate(order, subtotal) { return order.isCustomerType(this.type) ? subtotal * this.rate : 0; }
}
class CouponDiscount {
  constructor(code, rate) { this.code = code; this.rate = rate; }
  calculate(order, subtotal) { return order.hasCoupon(this.code) ? subtotal * this.rate : 0; }
}
class HighValueDiscount {
  calculate(order, subtotal) { return subtotal > 8000 ? 250 : 0; }
}
class DiscountCalculator {
  constructor(rules) { this.rules = rules; }
  calculate(order, subtotal) {
    return this.rules.reduce((discount, rule) => discount + rule.calculate(order, subtotal), 0);
  }
}
module.exports = { DiscountCalculator, CustomerDiscount, CouponDiscount, HighValueDiscount };
