class Customer {
  constructor(id, name, email, phone, type, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.address = address;
  }
  hasValidEmail() { return Boolean(this.email && this.email.includes("@")); }
  isType(type) { return this.type === type; }
  getRegion() { return this.address.region; }
  getDeliveryLocation() { return { city: this.address.city, state: this.address.state }; }
  getContact() { return { name: this.name, email: this.email }; }
}

module.exports = Customer;
