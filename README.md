# TechStore refatorado

Atividade de Arquitetura de Software — UNOESTE

**Aluno:** João Pedro De Oliveira Zafalon  
**Curso:** Análise e Desenvolvimento de Sistemas

## Executar

Requisito: Node.js 20 ou superior. A verificação registrada foi feita com Node.js 24.19.0.

Na pasta que contém `package.json`:

```bash
npm start
npm test
```

Não há dependências externas, banco de dados ou necessidade de `npm install`.

Opcional, na versão de Node usada na verificação:

```bash
npm run test:coverage
```

O programa é uma aplicação de console. Não abre site ou tela no navegador.

## Exemplo

O pedido de Ana Souza contém um notebook e dois mouses, com cliente VIP, cupom TECH10 e cartão em três parcelas. Resultado:

| Campo | Valor |
| --- | ---: |
| Subtotal | R$ 6.440,00 |
| Desconto | R$ 1.159,20 |
| Frete | R$ 30,00 |
| Taxa | R$ 161,00 |
| Total | R$ 5.471,80 |
| Situação | confirmed |

## Organização

- `src/domain`: entidades e operações sobre seus próprios dados
- `src/services/OrderService.js`: coordenação do processamento
- `src/services/OrderValidator.js`: validações do cliente e itens
- `src/services/InventoryService.js`: consulta e baixa de estoque
- `src/services/DiscountCalculator.js`: composição de regras de desconto
- `src/services/FreightCalculator.js`: tabela de fretes e cupom FRETEGRATIS
- `src/services/PaymentService.js`: processadores de PIX, cartão e boleto
- `src/services/OrderPresenter.js`: impressão do resumo
- `src/services/NotificationService.js`: simulação de confirmação no console
- `src/createApplication.js`: montagem e injeção das dependências
- `test/order.test.js`: testes automatizados
- `test/fixtures/original`: cópia do código original usada somente como referência nos testes
- `evidencias`: saídas reais de execução e testes.

## Principais mudanças

O serviço de pedidos deixou de concentrar validações, descontos, frete, pagamento e impressão. As dependências são recebidas pelo construtor. Regras de desconto e processadores de pagamento podem ser substituídos sem editar o serviço de pedidos. A mesma instância de repositório de produtos é usada na montagem do exemplo e na baixa de estoque.

O acesso `order.customer.address.region` foi substituído por `order.getRegion()`. O pedido delega ao cliente, que conhece seu endereço. O peso de cada item é calculado pelo próprio item. Isso reduz o conhecimento sobre a estrutura interna dos colaboradores.

## Origem e correção necessária para executar

Fonte: https://github.com/vanessaborges2/refatoracao-solid

Commit analisado: `511732495c69d01de227482d00b0a2e62a08aae3`.

O projeto original importa `NotificationService`, mas não contém esse arquivo. `npm start` originalmente falha com `MODULE_NOT_FOUND`. A refatoração adiciona uma simulação de notificação no console. Ela não envia e-mails reais. Não é possível comparar o texto de uma implementação de notificação que não foi fornecida.

O teste comparativo executa o `OrderService` original em memória com uma implementação vazia apenas para essa dependência ausente e um logger silencioso. As fórmulas originais não são alteradas. São comparados resumo e estoque em 576 cenários (3 tipos de cliente × 4 cupons × 6 regiões × 4 opções de pagamento × 2 quantidades). As cópias de referência não fazem parte da aplicação executada por `npm start`.

## Limites mantidos do projeto base

Pagamentos e notificações são simulações, os repositórios usam memória e não há transações. A validação de estoque permanece por linha do pedido; itens repetidos do mesmo produto não têm suas quantidades agregadas. A validação de e-mail continua simples. Essas regras não foram ampliadas para evitar misturar novas funcionalidades com a refatoração estrutural. Os testes demonstram preservação nos cenários cobertos, não uma prova para qualquer entrada possível.

## Evidências

- `01-original.txt`: falha real do original pela ausência de NotificationService.
- `02-refatorado.txt`: exemplo executado após a refatoração.
- `03-testes.txt`: 19 testes aprovados e nenhuma falha.
- `04-cobertura.txt`: execução adicional com cobertura no Node 24.19.0.

A cobertura é um complemento à comparação de valores e efeitos, não uma garantia isolada de qualidade.
