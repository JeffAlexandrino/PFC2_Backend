import nodemailer, { Transporter } from "nodemailer";
import SaleService from "./sale.service";
import config from "../config/config";
import logger from "../config/logger";

import { EstadoVenda } from "@prisma/client";

const emailValido = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export default class EmailService {
    private static transport: Transporter = nodemailer.createTransport(config.email.smtp);

    static {
        if (config.env !== "test") {
            this.transport
                .verify()
                .then(() => logger.info("Conectado ao servidor de email"))
                .catch((err: unknown) => {
                    logger.warn(
                        "Não foi possível conectar-se ao servidor de e-mail. Certifique-se de ter configurado as opções SMTP em .env"
                    );
                    logger.debug("Erro SMTP:", err);
                });
        }
    }

    private static formatTextMessage(text: string): string {
        return `${text}\n\n---\nEste e-mail foi enviado automaticamente pelo sistema CommissionPro. Não responda este e-mail.`;
    }

        private static async sendEmail(to: string | string[], subject: string, text: string, html?: string) {
            if (config.env === "test") return;

            const recipients = Array.isArray(to) ? to : [to];
            const invalidRecipients = recipients.filter((r) => !emailValido(r));

            if (invalidRecipients.length > 0) {
                logger.warn(`E-mails inválidos detectados: ${invalidRecipients.join(", ")}. Não serão enviados.`);
            }

            const validRecipients = recipients.filter(emailValido);
            if (validRecipients.length === 0) return;

            const msg = {
                from: config.email.from,
                to: validRecipients,
                subject,
                text: this.formatTextMessage(text),
                html,
            };

            try {
                await this.transport.sendMail(msg);
                logger.info(`E-mail enviado para ${validRecipients.join(", ")} com assunto: "${subject}"`);
            } catch (error) {
                logger.error(`Erro ao enviar e-mail para ${validRecipients.join(", ")}:`, error);
            }
        }

    public static async sendCredentials(to: string, password: string) {
        const subject = "Credenciais de acesso";
        const text = `Querido usuário,
Aqui estão suas credenciais de acesso:
- Email: ${to}
- Senha: ${password}
- Link para acesso ao sistema: https://comissionpro.protectsolutions.com.br/login

Por favor, troque sua senha assim que possível!`;

        await this.sendEmail(to, subject, text);
    }

    public static async sendResetPasswordEmail(to: string, token: string, redirect: string) {
        const subject = "Redefinir senha de acesso";
        const resetPasswordUrl = `${redirect}?token=${token}`;
        const text = `Caro usuário,
Para atualizar sua senha, clique no link a seguir: 
${resetPasswordUrl}

Se você não requisitou troca de senha, ignore este email.`;

        await this.sendEmail(to, subject, text);
    }

    public static async sendSaleStatusChangedEmail(to: string, newStatus: EstadoVenda, reason?: string | null) {
        const statusName = SaleService.getSaleStatusText(newStatus);
        const subject = `Venda atualizada para ${statusName}`;

        const text = `Olá,
Uma venda foi atualizada e agora está com status: ${statusName}.
${reason ? `Motivo da regressão: "${reason}"` : ""}

Por favor, acesse o sistema e revise os dados da venda para dar andamento ao processo de comissionamento.

Atenciosamente,
CommissionPro`;

        const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="background-color: #004080; color: white; padding: 20px;">
        <h2 style="margin: 0;">CommissionPro</h2>
      </div>

      <div style="padding: 20px; color: #333; font-size: 14px; line-height: 1.6;">
        <p>Olá,</p>
        <p>
          Uma venda foi atualizada e agora está com status: <strong>${statusName}</strong>.
          ${reason ? `<br><strong>Motivo da regressão:</strong> <em>"${reason}"</em>` : ""}
        </p>
        <p>
          Por favor, acesse o sistema e revise os dados da venda para dar andamento ao processo de comissionamento.
        </p>
        <p style="margin-top: 30px;">
          Atenciosamente, <br>
          <strong>CommissionPro</strong>
        </p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        Este e-mail foi enviado automaticamente pelo sistema CommissionPro. Não responda este e-mail.
      </div>
    </div>
  `;

        await this.sendEmail(to, subject, text, html);
    }
}
