class InventoryService {
  constructor(productRepository) { this.productRepository = productRepository; }
  validate(items) {
    for (const item of items) {
      const id = item.getProductId();
      const product = this.productRepository.findById(id);
      if (!product) throw new Error(`Produto ${id} nao encontrado.`);
      if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para ${product.name}.`);
    }
  }
  decrease(items) {
    for (const item of items) this.productRepository.updateStock(item.getProductId(), item.quantity);
  }
}
module.exports = InventoryService;
