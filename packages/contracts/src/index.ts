/**
 * Contratos compartilhados entre @natal/api e @natal/web.
 *
 * O que entra aqui: tipos e schemas que os dois lados precisam concordar.
 * O que NÃO entra: lógica de negócio, acesso a banco, dependência de runtime.
 *
 * Extensão `.js` nos re-exports: a API resolve este pacote como código-fonte
 * sob NodeNext, que exige extensão explícita. O bundler do frontend aceita a
 * mesma forma, então um único estilo serve aos dois consumidores.
 */
export * from './money.js';
export * from './player.js';
