import yup from "../../config/yup";

export default function yupDataArrSchema<DataProps extends yup.AnyObject>(dataProps: DataProps) {
    return yup
        .array(yup.object(dataProps).noUnknown(true).strict())
        .required("Espera-se o parâmetro 'data' na requisição do tipo (any[]).");
}
