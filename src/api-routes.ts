export class ApiRoutes {
    private static VERSION = process.env.npm_package_version ?? process.env.VERSION ?? "1";
    private static VERSION_PATH = "/version";

    private static ID_VAR = ":id";
    private static ID_ROUTE = "/" + this.ID_VAR;
    private static REPORTS = "/relatorios";
    private static DISABLE = "/disable";

    private static USERS = "/users";
    private static MY_USER_INFO = "/my-user/info";
    private static USER_PATCH = this.USERS + this.ID_ROUTE;
    private static USER_ROLES = "/user-roles";
    private static USER_ROLE_PATCH = this.ID_ROUTE + "/roles";
    private static USER_ROLE_FIND = this.ID_ROUTE;

    private static AUTH = "/auth";
    private static LOGIN = "/login";
    private static LOGOUT = "/logout";
    private static SESSION_ROLE = "/session/role"; //CHANGE_ CURRENT_ROLE route
    private static UPDATE_PASSWORD = "/person/password"; //Update Password route
    private static RESET_PASSWORD = "/reset-password";
    private static RESET_PASSWORD_TOKEN = "/reset-password-token"; //Forgot Password route
    private static SESSION_KEEP_ALIVE = "/session/keep-alive";

    private static ORGANIZATIONS = "/empresas";
    private static ORGANIZATION_PATCH = this.ORGANIZATIONS + this.ID_ROUTE;

    private static ORGANIZATION_TARGETS = "/empresa-targets";
    private static ORGANIZATION_TARGETS_PATCH = this.ORGANIZATION_TARGETS + this.ID_ROUTE;

    private static DASHBOARD = "/dashboards";
    private static DASH_EVOLUTIONS = "/evolucoes";
    private static DASH_TARGET = "/meta-atingida";
    private static DASH_TOTAL_VALUES = "/valores-totais";
    private static DASH_RANK_CUSTOMERS = "/rank-clientes";
    private static DASH_RANK_CATEGORY = "/rank-categorias";
    private static DASH_RANK_SALE_PERSON = "/rank-vendedores";
    private static DASH_MARGIN_CONTRIBUTION = "/margem-contribuicao";
    private static DASH_PRODUCT_SERVICE_TYPE = "/tipos-produto-servico";

    private static COMMISSIONS = "/comissoes";
    private static COMMISSION_PATCH = this.COMMISSIONS + this.ID_ROUTE;
    private static COMMISSION_TOGGLE_SUPPLIER_PAID = "/toggle/supplier-paid";
    private static COMMISSION_APPROVE_MANY = "/approve/many";
    private static COMMISSION_DISTRIBUTION = "/distribuicoes-comissao";
    private static COMMISSION_DISABLE = this.DISABLE + this.ID_ROUTE;
    private static COMMISSION_DISTRIBUTION_PATCH = this.COMMISSION_DISTRIBUTION + this.ID_ROUTE;

    private static INFO_ROLE = "/info/role";

    private static TARGETS = "/targets";
    private static TARGET_PATCH = this.TARGETS + this.ID_ROUTE;

    private static SALES = "/vendas";
    private static SALE_PATCH = this.SALES + this.ID_ROUTE;

    private static CONTRACTS = "/contratos";
    private static CONTRACT_PATH = this.CONTRACTS + this.ID_ROUTE;

    private static VISITS = "/visitas";
    private static VISIT_PATCH = this.VISITS + this.ID_ROUTE;
    private static EXPENSE_ROLE = "/expense/role";

    private static VISITS_REPORTS = this.REPORTS + this.VISITS;
    private static REPORTS_COMMISSIONS = this.REPORTS + this.COMMISSIONS;
    private static REPORTS_SALES_CLIENT = this.SALES + "/client";
    private static REPORTS_SALES_USER = this.SALES + "/user";
    private static REPORTS_USERS = "/user";

    private static CATEGORYS = "/categorias";
    private static CATEGORY_PATCH = this.CATEGORYS + this.ID_ROUTE;

    private static CUSTOMERS = "/clientes";
    private static CUSTOMERS_IMPORT = "/importar";
    private static CUSTOMER_PATCH = this.CUSTOMERS + this.ID_ROUTE;

    private static MANUFACTURERS = "/fabricantes";
    private static MANUFACTURER_PATCH = this.MANUFACTURERS + this.ID_ROUTE;

    private static PAYMENT_METHODS = "/formas-pagamento";
    private static PAYMENT_METHOD_PATCH = this.PAYMENT_METHODS + this.ID_ROUTE;

    private static PRODUCTS = "/produtos";
    private static PRODUCT_PATCH = this.PRODUCTS + this.ID_ROUTE;

    private static SERVICES = "/servicos";
    private static SERVICE_PATCH = this.SERVICES + this.ID_ROUTE;

    private static SEGMENTS = "/segmentos";
    private static SEGMENT_PATCH = this.SEGMENTS + this.ID_ROUTE;

    private static SUPPLIERS = "/fornecedores";
    private static SUPPLIER_PATCH = this.SUPPLIERS + this.ID_ROUTE;

    private static AUDIT = "/auditorias";
    private static PRODUCT_SERVICE_TYPE = "/tipo-produto-servico";
    private static PRODUCT_SERVICE_TYPE_PATCH = this.PRODUCT_SERVICE_TYPE + this.ID_ROUTE;

    public static get getVersion(): string {
        return this.VERSION;
    }
    public static getRouteVersion = (): string => "/v1"; // version path of server
    public static getPathVersion = (): string => this.VERSION_PATH;

    public static getIdRoute = (): string => this.ID_ROUTE;

    public static getReports = (): string => this.REPORTS;
    public static getVisitsReport = (): string => this.VISITS_REPORTS;
    public static getCommissionsReports = (): string => this.REPORTS_COMMISSIONS;
    public static getReportSalesClient = (): string => this.REPORTS_SALES_CLIENT;
    public static getReportSalesUser = (): string => this.REPORTS_SALES_USER;
    public static getReportsUsers = (): string => this.REPORTS_USERS;

    public static getUser = (): string => this.USERS;
    public static postUser = this.getUser;
    public static getUserRoles = (): string => this.USER_ROLES;
    public static getEditRoleUser = (): string => this.USER_ROLE_PATCH;
    public static getMyUserInfo = (): string => this.MY_USER_INFO;
    public static patchUser = (id: string): string => this.USER_PATCH.replace(this.ID_VAR, id);
    public static patchUserRole = (id: string): string => this.USER_ROLE_PATCH.replace(this.ID_VAR, id);
    public static findUserRole = (id: string): string => this.USER_ROLE_FIND.replace(this.ID_VAR, id);
    public static deleteUser = this.patchUser;

    public static getAuth = (): string => this.AUTH;
    public static getLogin = (): string => this.LOGIN;
    public static getLogout = (): string => this.LOGOUT;
    public static getResetPassword = (): string => this.RESET_PASSWORD;
    public static getSessionRole = (): string => this.SESSION_ROLE;
    public static getUpdatePassword = (): string => this.UPDATE_PASSWORD;
    public static getResetPasswordToken = (): string => this.RESET_PASSWORD_TOKEN;
    public static getSessionKeepAlive = (): string => this.SESSION_KEEP_ALIVE;

    public static getDashboard = (): string => this.DASHBOARD;
    public static getDashTarget = (): string => this.DASH_TARGET;
    public static getDashEvolutions = (): string => this.DASH_EVOLUTIONS;
    public static getDashTotalValues = (): string => this.DASH_TOTAL_VALUES;
    public static getDashMarginContribution = (): string => this.DASH_MARGIN_CONTRIBUTION;
    public static getDashRankSalePerson = (): string => this.DASH_RANK_SALE_PERSON;
    public static getDashRankCustomers = (): string => this.DASH_RANK_CUSTOMERS;
    public static getDashRankCategory = (): string => this.DASH_RANK_CATEGORY;
    public static getDashProductServiceType = (): string => this.DASH_PRODUCT_SERVICE_TYPE;

    public static getCommissions = (): string => this.COMMISSIONS;
    public static getCommissionsSupplierPaid = (): string => this.COMMISSION_TOGGLE_SUPPLIER_PAID;
    public static getCommissionsApproveMany = (): string => this.COMMISSION_APPROVE_MANY;
    public static getCommissionsDistributions = (): string => this.COMMISSION_DISTRIBUTION;
    public static getCommissionsDisable = (): string => this.COMMISSION_DISABLE;
    public static patchCommissionsDisable = (id: string): string => this.COMMISSION_DISABLE.replace(this.ID_VAR, id);

    public static getInfoRole = (): string => this.INFO_ROLE;

    public static patchCommissionsDistribution = (id: string): string =>
        this.COMMISSION_DISTRIBUTION_PATCH.replace(this.ID_VAR, id);
    public static patchCommission = (id: string): string => this.COMMISSION_PATCH.replace(this.ID_VAR, id);

    public static getAudit = (): string => this.AUDIT;

    public static getTargets = (): string => this.TARGETS;
    public static postTarget = this.getTargets;
    public static patchTarget = (id: string): string => this.TARGET_PATCH.replace(this.ID_VAR, id);
    public static deleteTarget = this.patchTarget;

    public static getOrganizationTargets = (): string => this.ORGANIZATION_TARGETS;
    public static postOrganizationTargets = this.getOrganizationTargets;
    public static patchOrganizationTarget = (id: string): string =>
        this.ORGANIZATION_TARGETS_PATCH.replace(this.ID_VAR, id);
    public static deleteOrganizationTarget = this.patchOrganizationTarget;

    public static getContracts = (): string => this.CONTRACTS;
    public static patchContract = (id: string): string => this.CONTRACT_PATH.replace(this.ID_VAR, id);

    public static getOrganizations = (): string => this.ORGANIZATIONS;
    public static patchOrganization = (id: string): string => this.ORGANIZATION_PATCH.replace(this.ID_VAR, id);

    public static getVisits = (): string => this.VISITS;
    public static getExpenseRoleVisits = (): string => this.EXPENSE_ROLE;
    public static patchVisit = (id: string): string => this.VISIT_PATCH.replace(this.ID_VAR, id);

    public static getCategorys = (): string => this.CATEGORYS;
    public static patchCategory = (id: string): string => this.CATEGORY_PATCH.replace(this.ID_VAR, id);

    public static getCustomers = (): string => this.CUSTOMERS;
    public static importCustomers = (): string => this.CUSTOMERS_IMPORT;
    public static patchCustomer = (id: string): string => this.CUSTOMER_PATCH.replace(this.ID_VAR, id);

    public static getManufacturers = (): string => this.MANUFACTURERS;
    public static patchManufacturer = (id: string): string => this.MANUFACTURER_PATCH.replace(this.ID_VAR, id);

    public static getPaymentMethods = (): string => this.PAYMENT_METHODS;
    public static patchPaymentMethod = (id: string): string => this.PAYMENT_METHOD_PATCH.replace(this.ID_VAR, id);

    public static getProductServiceType = (): string => this.PRODUCT_SERVICE_TYPE;
    public static patchProductServiceType = (id: string): string =>
        this.PRODUCT_SERVICE_TYPE_PATCH.replace(this.ID_VAR, id);

    public static getProducts = (): string => this.PRODUCTS;
    public static patchProduct = (id: string): string => this.PRODUCT_PATCH.replace(this.ID_VAR, id);

    public static getServices = (): string => this.SERVICES;
    public static patchService = (id: string): string => this.SERVICE_PATCH.replace(this.ID_VAR, id);

    public static getSegments = (): string => this.SEGMENTS;
    public static patchSegment = (id: string): string => this.SEGMENT_PATCH.replace(this.ID_VAR, id);

    public static getSuppliers = (): string => this.SUPPLIERS;
    public static patchSupplier = (id: string): string => this.SUPPLIER_PATCH.replace(this.ID_VAR, id);

    public static getSales = (): string => this.SALES;
    public static postSale = this.getSales;
    public static patchSale = (id: string): string => this.SALE_PATCH.replace(this.ID_VAR, id);
    public static deleteSale = this.patchSale;
}
