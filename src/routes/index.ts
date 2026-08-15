import distribuicaoComissaoRoute from "./comission-distribution.route";
import tipoProdServRoute from "./product-service-type.route";
import formaPagamentoRoute from "./payment-method.route";
import OrganizationTargetRoute from "./organization-target.route";
import manufactererRoute from "./manufacterer.route";
import empresaRoute from "./organization.route";
import dashboardRoute from "./dashboard.route";
import comissaoRoute from "./commission.route";
import fornecedorRoute from "./supplier.route";
import userRoleRoute from "./user-role.route";
import categoriaRoute from "./category.route";
import contratoRoute from "./contract.route";
import relatorioRoute from "./report.route";
import clienteRoute from "./customer.route";
import produtosRoute from "./product.route";
import segmentoRoute from "./segment.route";
import servicoRoute from "./service.route";
import auditoriaRoute from "./audit.route";
import versionRoute from "./version.route";
import targetRoute from "./target.route";
import visitaRoute from "./visit.route";
import vendasRoute from "./sale.route";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import express from "express";

import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

const defaultRoutes = [
    { path: ApiRoutes.getAuth(), route: authRoute },
    { path: ApiRoutes.getUser(), route: userRoute },
    { path: ApiRoutes.getCustomers(), route: clienteRoute },
    { path: ApiRoutes.getSuppliers(), route: fornecedorRoute },
    { path: ApiRoutes.getManufacturers(), route: manufactererRoute },
    { path: ApiRoutes.getTargets(), route: targetRoute },
    { path: ApiRoutes.getOrganizationTargets(), route: OrganizationTargetRoute },
    { path: ApiRoutes.getProductServiceType(), route: tipoProdServRoute },
    { path: ApiRoutes.getCategorys(), route: categoriaRoute },
    { path: ApiRoutes.getSegments(), route: segmentoRoute },
    { path: ApiRoutes.getProducts(), route: produtosRoute },
    { path: ApiRoutes.getServices(), route: servicoRoute },
    { path: ApiRoutes.getSales(), route: vendasRoute },
    { path: ApiRoutes.getAudit(), route: auditoriaRoute },
    { path: ApiRoutes.getDashboard(), route: dashboardRoute },
    { path: ApiRoutes.getCommissions(), route: comissaoRoute },
    { path: ApiRoutes.getPathVersion(), route: versionRoute },
    { path: ApiRoutes.getPaymentMethods(), route: formaPagamentoRoute },
    { path: ApiRoutes.getCommissionsDistributions(), route: distribuicaoComissaoRoute },
    { path: ApiRoutes.getVisits(), route: visitaRoute },
    { path: ApiRoutes.getContracts(), route: contratoRoute },
    { path: ApiRoutes.getReports(), route: relatorioRoute },
    { path: ApiRoutes.getOrganizations(), route: empresaRoute },
    { path: ApiRoutes.getUserRoles(), route: userRoleRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
