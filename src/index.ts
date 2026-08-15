import server, { API_PORT } from "./server";
import { ApiRoutes } from "./api-routes";

server.listen(API_PORT, () => {
    console.log(`🚀 v${ApiRoutes.getVersion} Servidor rodando em http://localhost:${API_PORT}`);
});
