import { ApiRoutes } from "../../src/api-routes";

export class ApiTestRoutes {
    private static ROUTE_VERSION = ApiRoutes.getRouteVersion();

    public static AUDIT_ROUTE = this.ROUTE_VERSION + ApiRoutes.getAudit();

    public static BASE_AUTH_ROUTE = this.ROUTE_VERSION + ApiRoutes.getAuth();
    public static RESET_FORGOT_PASSWORD_ROUTE = this.BASE_AUTH_ROUTE + ApiRoutes.getResetPassword();
    public static CHANGE_CURRENT_ROLE_ROUTE = this.BASE_AUTH_ROUTE + ApiRoutes.getSessionRole();
    public static UPDATE_PASSWORD_ROUTE = this.BASE_AUTH_ROUTE + ApiRoutes.getUpdatePassword();
    public static FORGOT_PASSWORD_ROUTE = this.BASE_AUTH_ROUTE + ApiRoutes.getResetPasswordToken();
    public static KEEP_ALIVE_SESSION = this.BASE_AUTH_ROUTE + ApiRoutes.getSessionKeepAlive();
    public static LOGOUT_ROUTE = this.BASE_AUTH_ROUTE + ApiRoutes.getLogout();
    public static LOGIN_ROUTE = this.BASE_AUTH_ROUTE + ApiRoutes.getLogin();

    public static USER_ROUTE = this.ROUTE_VERSION + ApiRoutes.getUser();
    public static MY_USER_INFO_ROUTE = this.USER_ROUTE + ApiRoutes.getMyUserInfo();
    public static PATCH_USER_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchUser(id);

    public static USER_ROLES_ROUTE = this.ROUTE_VERSION + ApiRoutes.getUserRoles();
    public static PATCH_USER_ROLE_ROUTE = (id: string): string => this.USER_ROLES_ROUTE + ApiRoutes.patchUserRole(id);
    public static FIND_USER_ROLE_ROUTE = (id: string): string => this.USER_ROLES_ROUTE + ApiRoutes.findUserRole(id);

    public static COMMISSION_ROUTE = this.ROUTE_VERSION + ApiRoutes.getCommissions();
    public static COMMISSION_INFO_PER_ROLE_ROUTE = this.COMMISSION_ROUTE + ApiRoutes.getInfoRole();
    public static COMMISSION_APPROVE_MANY_ROUTE = this.COMMISSION_ROUTE + ApiRoutes.getCommissionsApproveMany();
    public static COMMISSION_TOGGLE_SUPPLIER_PAID = this.COMMISSION_ROUTE + ApiRoutes.getCommissionsSupplierPaid();
    public static REPORT_COMMISSION_ROUTE = this.ROUTE_VERSION + ApiRoutes.getCommissionsReports();
    public static COMMISSION_DISABLE_ROUTE = ApiRoutes.getCommissionsDisable();
    public static COMMISSION_DISTRIBUTION_ROUTE = this.ROUTE_VERSION + ApiRoutes.getCommissionsDistributions();
    public static PATCH_COMMISSION_DISTRIBUTION_ROUTE = (id: string): string =>
        this.ROUTE_VERSION + ApiRoutes.patchCommissionsDistribution(id);
    public static PATCH_COMMISSION_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchCommission(id);

    public static CONTRACT_ROUTE = this.ROUTE_VERSION + ApiRoutes.getContracts();
    public static PATCH_CONTRACT_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchContract(id);

    public static DASHBOARD_ROUTE = this.ROUTE_VERSION + ApiRoutes.getDashboard();
    public static DASH_PRODUCT_SERVICE_TYPE_RANK_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashProductServiceType();
    public static DASH_CONTRIBUTION_MARGIN = this.DASHBOARD_ROUTE + ApiRoutes.getDashMarginContribution();
    public static DASH_SALE_PERSON_RANK_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashRankSalePerson();
    public static DASH_CATEGORY_RANK_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashRankCategory();
    public static DASH_CUSTOMER_RANK_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashRankCustomers();
    public static DASH_TOTAL_VALUES_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashTotalValues();
    public static DASH_EVOLUTION_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashEvolutions();
    public static DASH_TARGET_ROUTE = this.DASHBOARD_ROUTE + ApiRoutes.getDashTarget();

    public static ORGANIZATION_ROUTE = this.ROUTE_VERSION + ApiRoutes.getOrganizations();
    public static PATCH_ORGANIZATION_ROUTE = (id: string): string =>
        this.ROUTE_VERSION + ApiRoutes.patchOrganization(id);

    public static SALE_ROUTE = this.ROUTE_VERSION + ApiRoutes.getSales();
    public static PATCH_SALE_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchSale(id);

    public static TARGETS_ROUTE = this.ROUTE_VERSION + ApiRoutes.getTargets();
    public static PATCH_TARGETS_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchTarget(id);

    public static VISIT_ROUTE = this.ROUTE_VERSION + ApiRoutes.getVisits();
    public static VISIT_REPORT_ROUTE = this.ROUTE_VERSION + ApiRoutes.getVisitsReport();
    public static VISIT_EXPENSE_ROUTE = this.VISIT_ROUTE + ApiRoutes.getExpenseRoleVisits();
    public static PATCH_VISIT_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchVisit(id);

    public static CATEGORY_ROUTE = this.ROUTE_VERSION + ApiRoutes.getCategorys();
    public static PATCH_CATEGORY_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchCategory(id);

    public static CUSTOMER_ROUTE = this.ROUTE_VERSION + ApiRoutes.getCustomers();
    public static CUSTOMER_IMPORT_ROUTE = this.CUSTOMER_ROUTE + ApiRoutes.importCustomers();
    public static PATCH_CUSTOMER_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchCustomer(id);

    public static MANUFACTURER_ROUTE = this.ROUTE_VERSION + ApiRoutes.getManufacturers();
    public static PATCH_MANUFACTURER_ROUTE = (id: string): string =>
        this.ROUTE_VERSION + ApiRoutes.patchManufacturer(id);

    public static PAYMENT_METHOD_ROUTE = this.ROUTE_VERSION + ApiRoutes.getPaymentMethods();
    public static PATCH_PAYMENT_METHOD_ROUTE = (id: string): string =>
        this.ROUTE_VERSION + ApiRoutes.patchPaymentMethod(id);

    public static PRODUCT_SERVICE_TYPE_ROUTE = this.ROUTE_VERSION + ApiRoutes.getProductServiceType();
    public static PATCH_PRODUCT_SERVICE_TYPE_ROUTE = (id: string): string =>
        this.ROUTE_VERSION + ApiRoutes.patchProductServiceType(id);

    public static PRODUCT_ROUTE = this.ROUTE_VERSION + ApiRoutes.getProducts();
    public static PATCH_PRODUCT_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchProduct(id);

    public static SEGMENT_ROUTE = this.ROUTE_VERSION + ApiRoutes.getSegments();
    public static PATCH_SEGMENT_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchSegment(id);

    public static SERVICE_ROUTE = this.ROUTE_VERSION + ApiRoutes.getServices();
    public static PATCH_SERVICE_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchService(id);

    public static SUPPLIERS_ROUTE = this.ROUTE_VERSION + ApiRoutes.getSuppliers();
    public static PATCH_SUPPLIERS_ROUTE = (id: string): string => this.ROUTE_VERSION + ApiRoutes.patchSupplier(id);
}
