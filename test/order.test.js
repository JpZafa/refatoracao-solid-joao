const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createRequire } = require('node:module');
const createApplication = require('../src/createApplication');
const Address = require('../src/domain/Address');
const Customer = require('../src/domain/Customer');
const Order = require('../src/domain/Order');
const OrderItem = require('../src/domain/OrderItem');
const Product = require('../src/domain/Product');
const ProductRepository = require('../src/repositories/ProductRepository');
const { DiscountCalculator } = require('../src/services/DiscountCalculator');
const { PaymentService } = require('../src/services/PaymentService');
const silent = { log() {} };
const date = new Date('2026-10-08T12:00:00Z');
function fixture(options = {}) {
  const app = createApplication({ output: silent, ...options.dependencies });
  const customer = new Customer('c1', 'Ana Souza', 'ana@example.com', '18999990000',
    options.type || 'vip', new Address('Rua A', '1', 'Presidente Prudente', 'SP', '19000-000', options.region || 'sudeste'));
  const items = options.items || [new OrderItem(app.productRepository.findById('p1'), 1),
    new OrderItem(app.productRepository.findById('p2'), 2)];
  const order = new Order('o1', customer, items, options.coupon ?? 'TECH10',
    options.method || 'credit_card', options.installments ?? 3);
  order.createdAt = date;
  return { ...app, order };
}
// O arquivo abaixo e o OrderService original, sem refatoracao.
// A unica substituicao e a dependencia ausente NotificationService, simulada em memoria.
function originalService() {
  const filename = path.join(__dirname, 'fixtures/original/src/services/OrderService.js');
  const localRequire = createRequire(filename);
  const exports = { exports: {} };
  class MissingNotification { sendOrderConfirmation() {} }
  class SilentLogger { info() {} warn() {} }
  const originalRequire = name => name === './NotificationService' ? MissingNotification
    : name === '../utils/Logger' ? SilentLogger : localRequire(name);
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    require: originalRequire, module: exports, console: silent
  }, { filename });
  return new exports.exports();
}
function plain(value) { return JSON.parse(JSON.stringify(value)); }

test('exemplo do README tem valores, registro, estoque e notificacao corretos', () => {
  const calls = [];
  const f = fixture({ dependencies: { notification: { sendOrderConfirmation(...args) { calls.push(args); } } } });
  const result = f.orderService.process(f.order);
  assert.deepEqual([result.subtotal, result.discount, result.freight, result.paymentFee, result.total],
    [6440, 1159.2, 30, 161, 5471.8]);
  assert.equal(result.status, 'confirmed');
  assert.equal(f.productRepository.findById('p1').stock, 7);
  assert.equal(f.productRepository.findById('p2').stock, 28);
  assert.deepEqual(f.orderRepository.findAll(), [result]);
  assert.deepEqual(calls, [[{ name: 'Ana Souza', email: 'ana@example.com' }, 'o1', 5471.8]]);
});

test('576 cenarios preservam o resumo e estoque calculados pelo codigo original', () => {
  let count = 0;
  for (const type of ['regular', 'vip', 'employee'])
    for (const coupon of ['', 'TECH10', 'FRETEGRATIS', 'OUTRO'])
      for (const region of ['sudeste', 'sul', 'centro-oeste', 'nordeste', 'norte', 'outra'])
        for (const payment of [{ method: 'pix' }, { method: 'boleto' },
          { method: 'credit_card', installments: 1 }, { method: 'credit_card', installments: 3 }])
          for (const quantity of [1, 2]) {
            const f = fixture({ type, coupon, region, ...payment });
            f.order.items[0].quantity = quantity;
            const original = originalService();
            const clone = fixture({ type, coupon, region, ...payment });
            clone.order.items[0].quantity = quantity;
            const expected = original.process(clone.order);
            const actual = f.orderService.process(f.order);
            const label = JSON.stringify({ type, coupon, region, ...payment, quantity });
            assert.deepEqual(plain(actual), plain(expected), label);
            assert.deepEqual(plain(f.productRepository.list()), plain(original.productRepository.list()), label);
            count++;
          }
  assert.equal(count, 576);
});

for (const [label, change, message] of [
  ['sem cliente', o => { o.customer = null; }, 'Cliente obrigatorio.'],
  ['email invalido', o => { o.customer.email = 'invalido'; }, 'E-mail do cliente invalido.'],
  ['sem itens', o => { o.items = []; }, 'Pedido sem itens.'],
  ['item sem produto', o => { o.items = [new OrderItem(null, 1)]; }, 'Item sem produto.'],
  ['quantidade zero', o => { o.items[0].quantity = 0; }, 'Quantidade invalida.'],
  ['quantidade negativa', o => { o.items[0].quantity = -1; }, 'Quantidade invalida.'],
  ['produto inexistente', o => { o.items = [new OrderItem(new Product('x', 'Outro', 'x', 10, 1, 10), 1)]; }, 'Produto x nao encontrado.'],
  ['estoque insuficiente', o => { o.items[0].quantity = 9; }, 'Estoque insuficiente para Notebook Pro 14.'],
  ['pagamento invalido', o => { o.paymentMethod = 'dinheiro'; }, 'Forma de pagamento invalida.'],
  ['total invalido', o => { o.items[0].product.price = 0; o.items[1].product.price = 0; o.couponCode = 'FRETEGRATIS'; }, 'Total do pedido invalido.']
]) test(`${label} mantem o erro original e nao altera estoque nem salva`, () => {
  const f = fixture();
  change(f.order);
  const stocks = f.productRepository.list().map(p => p.stock);
  const original = originalService();
  const other = fixture(); change(other.order);
  assert.throws(() => original.process(other.order), { message });
  assert.throws(() => f.orderService.process(f.order), { message });
  assert.deepEqual(f.productRepository.list().map(p => p.stock), stocks);
  assert.equal(f.orderRepository.findAll().length, 0);
  assert.equal(f.order.status, 'created');
});

test('boleto aguarda pagamento e nao envia confirmacao', () => {
  let notified = false;
  const f = fixture({ method: 'boleto', dependencies: {
    notification: { sendOrderConfirmation() { notified = true; } }
  } });
  const result = f.orderService.process(f.order);
  assert.equal(result.status, 'waiting_payment');
  assert.equal(result.paymentFee, 0);
  assert.equal(notified, false);
  assert.equal(f.productRepository.findById('p1').stock, 7);
});

test('limite de desconto adicional e estritamente maior que 8000', () => {
  for (const [price, discount] of [[8000, 0], [8000.01, 250]]) {
    const f = fixture({ type: 'regular', coupon: '', method: 'boleto' });
    f.order.items = [new OrderItem(new Product('p1', 'Produto', 'x', price, 1, 8), 1)];
    assert.equal(f.orderService.process(f.order).discount, discount);
  }
});

test('PIX acumula 3 por cento com VIP e TECH10', () => {
  const f = fixture({ method: 'pix' });
  const r = f.orderService.process(f.order);
  assert.equal(r.discount, 1352.4);
  assert.equal(r.total, 5117.6);
});

test('composicao permite nova regra e novo pagamento sem mudar OrderService', () => {
  const f = fixture({ method: 'teste', dependencies: {
    discounts: new DiscountCalculator([{ calculate() { return 100; } }]),
    payments: new PaymentService({ teste: { process() { return { status: 'approved', discount: 0, fee: 10 }; } } })
  } });
  const r = f.orderService.process(f.order);
  assert.equal(r.total, 6380);
  assert.equal(r.status, 'confirmed');
});

test('instancia compartilhada de repositorio recebe baixas de pedidos sucessivos', () => {
  const repository = new ProductRepository();
  for (let i = 0; i < 2; i++) {
    const f = fixture({ dependencies: { productRepository: repository } });
    f.orderService.process(f.order);
  }
  assert.equal(repository.findById('p1').stock, 6);
  assert.equal(repository.findById('p2').stock, 26);
});

test('objetos de dominio calculam peso, quantidade e resumo dos itens', () => {
  const { order } = fixture();
  assert.equal(order.getTotalItems(), 3);
  assert.equal(order.getTotalWeight(), 2.5);
  assert.equal(order.getRegion(), 'sudeste');
  assert.deepEqual(order.items[1].toSummary(), { productId: 'p2', name: 'Mouse Sem Fio', quantity: 2, subtotal: 240 });
});

test('apresentacao mantem as linhas e a formatacao do resumo', () => {
  const lines = [];
  const f = fixture({ dependencies: { output: { log(line) { lines.push(line); } } } });
  f.orderService.process(f.order);
  const index = lines.indexOf('Resumo do pedido');
  assert.deepEqual(lines.slice(index), ['Resumo do pedido', 'Cliente: Ana Souza',
    'Cidade: Presidente Prudente/SP', 'Itens: 3', 'Subtotal: R$ 6440.00',
    'Desconto: R$ 1159.20', 'Frete: R$ 30.00', 'Taxas: R$ 161.00', 'Total: R$ 5471.80']);
});


test('regioes com nomes de propriedades de Object usam o frete padrao original', () => {
  for (const region of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
    const f = fixture({ region });
    const original = originalService();
    const other = fixture({ region });
    assert.deepEqual(plain(f.orderService.process(f.order)), plain(original.process(other.order)));
  }
});

test('primeiro item com estoque insuficiente tem prioridade sobre segundo item sem produto', () => {
  const f = fixture();
  f.order.items[0].quantity = 9;
  f.order.items[1].product = null;
  const original = originalService();
  const other = fixture();
  other.order.items[0].quantity = 9;
  other.order.items[1].product = null;
  const message = 'Estoque insuficiente para Notebook Pro 14.';
  assert.throws(() => original.process(other.order), { message });
  assert.throws(() => f.orderService.process(f.order), { message });
  assert.equal(f.productRepository.findById('p1').stock, 8);
  assert.equal(f.orderRepository.findAll().length, 0);
});
