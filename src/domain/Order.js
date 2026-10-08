class Order {
  constructor(id, customer, items, couponCode, paymentMethod, installments) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.couponCode = couponCode;
    this.paymentMethod = paymentMethod;
    this.installments = installments;
    this.status = "created";
    this.createdAt = new Date();
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getTotalWeight() {
    return this.items.reduce((total, item) => {
      return total + item.getTotalWeight();
    }, 0);
  }
  hasCustomer() { return Boolean(this.customer); }
  hasValidCustomerEmail() { return this.customer.hasValidEmail(); }
  isCustomerType(type) { return this.customer.isType(type); }
  hasCoupon(code) { return this.couponCode === code; }
  getRegion() { return this.customer.getRegion(); }
  getContact() { return this.customer.getContact(); }
  getDeliveryLocation() { return this.customer.getDeliveryLocation(); }
  setPaymentStatus(paymentStatus) {
    this.status = paymentStatus === "approved" ? "confirmed" : "waiting_payment";
  }
  toSummary(amounts) {
    const contact = this.getContact();
    const location = this.getDeliveryLocation();
    return { id: this.id, customerName: contact.name, customerEmail: contact.email,
      city: location.city, state: location.state,
      items: this.items.map(item => item.toSummary()), ...amounts,
      paymentMethod: this.paymentMethod, status: this.status, createdAt: this.createdAt };
  }
}

module.exports = Order;
