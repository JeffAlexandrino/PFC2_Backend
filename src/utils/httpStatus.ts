const httpStatus = {
    // ---- Respostas de sucesso ----
    OK: 200, // Requisição bem-sucedida -> retorna dados normalmente
    CREATED: 201, // Recurso criado com sucesso
    NO_CONTENT: 204, // Requisição bem-sucedida mas sem conteúdo para retornar

    // ---- Respostas de erro ----
    BAD_REQUEST: 400, // Usuário fez uma requisição inválida ou mal formatada
    UNAUTHORIZED: 401, // Usuário não autenticado - precisa fazer login
    FORBIDDEN: 403, // Usuário autenticado mas sem permissão para acessar o recurso
    NOT_FOUND: 404, // Recurso solicitado não encontrado no servidor
    CONFLICT: 409, // Conflito com o estado atual do recurso

    // ---- Erros do servidor ----
    INTERNAL_SERVER_ERROR: 500, // Erro genérico no servidor -> falha inesperada
};

export default httpStatus;
