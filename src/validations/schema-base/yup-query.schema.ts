import yup from "../../config/yup";

export default function yupQuerySchema<QueryProps extends yup.AnyObject>(queryProps: QueryProps) {
    return yup.object(queryProps).required("Espera-se o parâmetro 'query' na requisição.").noUnknown(true).strict();
}
