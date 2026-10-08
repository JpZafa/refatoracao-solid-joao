class FreightCalculator {
  constructor(rates, fallback) { this.rates = rates; this.fallback = fallback; }
  calculate(order) {
    if (order.hasCoupon("FRETEGRATIS")) return 0;
    const rate = this.rates[order.getRegion()] || this.fallback;
    return rate.base + order.getTotalWeight() * rate.perKg;
  }
}
module.exports = FreightCalculator;
