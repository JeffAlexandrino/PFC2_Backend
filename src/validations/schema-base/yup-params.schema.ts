import yup from "../../config/yup";

export default function yupParamsSchema<ParamsProps extends yup.AnyObject>(paramsProps: ParamsProps) {
    return yup.object(paramsProps).required("Espera-se o parâmetro 'params' na requisição.").noUnknown(true).strict();
}
