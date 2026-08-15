import yup from "../../config/yup";

export default function yupDataSchema<DataProps extends yup.AnyObject>(dataProps: DataProps) {
    return yup.object(dataProps).required("Espera-se o parâmetro 'data' na requisição.").noUnknown(true).strict();
}
