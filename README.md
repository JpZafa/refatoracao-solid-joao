# TechStore refatorado

Atividade de Arquitetura de Software — UNOESTE

**Aluno:** João Pedro De Oliveira Zafalon  
**Curso:** Análise e Desenvolvimento de Sistemas

O TechStore é um sistema de pedidos que calcula descontos e frete, simula pagamentos, atualiza o estoque e registra o pedido. O código foi refatorado com SOLID, composição e Princípio de Demeter para separar as responsabilidades e facilitar os testes.

## Como executar

É necessário ter Node.js 20 ou superior. Na pasta que contém `package.json`, execute:

```bash
npm start
```

O exemplo e o resumo do pedido aparecem no terminal. O projeto não tem dependências externas, por isso não precisa de `npm install`.

Para executar os testes:

```bash
npm test
```

## Resultado do exemplo

O pedido contém um notebook e dois mouses. A cliente é VIP, usa o cupom TECH10 e paga no cartão em três parcelas.

| Campo | Valor |
| --- | ---: |
| Subtotal | R$ 6.440,00 |
| Desconto | R$ 1.159,20 |
| Frete | R$ 30,00 |
| Taxa | R$ 161,00 |
| Total | R$ 5.471,80 |

## Arquivos do projeto

- `src`: código refatorado.
- `test`: testes automatizados e uma cópia do original usada na comparação.
- `evidencias`: registros de execução, testes e cobertura.

Foram executados 21 testes, todos aprovados. Um deles compara o resumo do pedido e o estoque em 576 cenários com o código original.

## Código original

Fonte: [Projeto da atividade](https://github.com/vanessaborges2/refatoracao-solid).

O original estava sem o arquivo `NotificationService.js`, necessário para executar. Foi adicionada uma confirmação no console. Na comparação dos testes, essa dependência ausente é substituída por uma implementação vazia.

Os dados continuam em memória, e os pagamentos e notificações são simulados. O relatório técnico com as justificativas das mudanças é entregue no arquivo Word.
