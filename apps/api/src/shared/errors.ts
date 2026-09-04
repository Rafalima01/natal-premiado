/**
 * Erro de aplicação com código HTTP e código de negócio.
 *
 * O Fastify lê `statusCode` de qualquer erro lançado, então basta lançar um
 * `AppError` de dentro de um handler para a resposta sair correta. O
 * `errorHandler` em `app.ts` cuida do formato e de nunca ecoar o corpo recebido.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** 401 — o token não prova quem é o portador. */
export const unauthorized = (code: string, message: string): AppError =>
  new AppError(401, code, message);

/** 404 — o recurso não existe. */
export const notFound = (code: string, message: string): AppError =>
  new AppError(404, code, message);

/**
 * 409 — o pedido conflita com o estado atual e repetir não resolve.
 * Usado quando um e-mail já pertence a outro jogador.
 */
export const conflict = (code: string, message: string): AppError =>
  new AppError(409, code, message);

/** 422 — sintaxe válida, mas a operação não pode ser aplicada. */
export const unprocessable = (code: string, message: string): AppError =>
  new AppError(422, code, message);
