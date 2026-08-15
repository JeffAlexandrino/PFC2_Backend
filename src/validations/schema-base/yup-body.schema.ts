import yup from "../../config/yup";

export default function yupBodySchema<BodyProps extends yup.AnyObject>(bodyProps: BodyProps) {
    return yup.object(bodyProps).required("Espera-se o parâmetro 'body' na requisição.").noUnknown(true).strict();
}
