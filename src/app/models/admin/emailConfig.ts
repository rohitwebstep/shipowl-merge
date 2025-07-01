import prisma from "@/lib/prisma";

interface Mail {
    id?: bigint; // Or use `string` if you're dealing with BigInt as a string
    panel?: string;
    module?: string;
    subject: string;
    action?: string;
    html_template: string | null;
    smtp_host: string;
    smtp_secure: boolean;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
    to: string,
    cc: string,
    bcc: string,
    status: boolean;
    createdAt?: Date;
    createdBy?: number | null;
    createdByRole?: string | null;
    updatedAt: Date;
    updatedBy?: number | null;
    updatedByRole?: string | null;
}


// type PanelType = "admin" | "dropshipper" | "supplier";

const serializeBigInt = <T>(obj: T): T => {
    if (typeof obj === "bigint") {
        return obj.toString() as unknown as T;
    }

    if (obj instanceof Date) {
        // Return Date object unchanged, no conversion
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt) as unknown as T;
    }

    if (obj && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
        ) as T;
    }

    return obj;
};

/**
 * Retrieves email configurations for a specific panel, module, and action.
 *
 * @param panel - The target panel (admin, dropshipper, supplier)
 * @param module - The related module (e.g., user, order, notification)
 * @param action - The triggering action (e.g., welcome, reset_password)
 * @param status - The status of the email config (default is true, can be set to false to fetch inactive configs)
 * @returns A response object with status and data or an error message
 */
export const getEmailConfig = async (
    panel: string,
    module: string,
    action: string,
    status: boolean = true // Default value is true
) => {
    try {
        console.log(`Fetching email configuration for panel: ${panel}, module: ${module}, action: ${action}, status: ${status}`);
        // Fetching the email configuration from the database based on conditions
        const emailConfig = await prisma.emailConfig.findFirst({
            where: {
                panel,
                module,
                action,
                status
            },
            orderBy: { id: "desc" },
        });

        if (!emailConfig) {
            return { status: false, message: "Email configuration not found" };
        }

        const to = emailConfig.to as { name: string; email: string }[];
        const cc = emailConfig.cc as { name: string; email: string }[];
        const bcc = emailConfig.bcc as { name: string; email: string }[];

        // Mapping the database result to the desired output format
        const config = {
            host: emailConfig.smtp_host,
            port: emailConfig.smtp_port,
            secure: emailConfig.smtp_secure,
            username: emailConfig.smtp_username,
            password: emailConfig.smtp_password,
            from_email: emailConfig.from_email,
            from_name: emailConfig.from_name,
            to,
            cc,
            bcc,
        };

        return { status: true, emailConfig: config, htmlTemplate: emailConfig.html_template, subject: emailConfig.subject };
    } catch (error) {
        console.error(`Error fetching email configuration for panel "${panel}", module "${module}", action "${action}":`, error);
        return { status: false, message: "Error fetching email configuration" };
    }
};

// 🟡 UPDATE
export const updateEmailConfig = async (
    adminId: number,
    adminRole: string,
    mailId: number,
    data: Mail
) => {
    try {

        const {
            subject,
            html_template,
            smtp_host,
            smtp_secure,
            smtp_port,
            smtp_username,
            smtp_password,
            from_email,
            from_name,
            to,
            cc,
            bcc,
            status,
            createdAt,
            createdBy,
            createdByRole,
            updatedAt,
            updatedBy,
            updatedByRole,
        } = data;

        const updatedData = {
            subject,
            html_template,
            smtp_host,
            smtp_secure,
            smtp_port,
            smtp_username,
            smtp_password,
            from_email,
            from_name,
            to,
            cc,
            bcc,
            status,
            createdAt,
            createdBy,
            createdByRole,
            updatedAt,
            updatedBy,
            updatedByRole,
        };

        const mail = await prisma.emailConfig.update({
            where: { id: mailId }, // Assuming 'id' is the correct primary key field
            data: updatedData,
        });

        return { status: true, mail: serializeBigInt(mail) };
    } catch (error) {
        console.error("❌ updateMail Error:", error);
        return { status: false, message: "Error updating mail" };
    }
};

// 🔵 GET BY ID
export const getEmailConfigById = async (id: number) => {
    try {
        const mail = await prisma.emailConfig.findUnique({
            where: { id },
        });

        if (!mail) return { status: false, message: "Mail not found" };
        return { status: true, mail: serializeBigInt(mail) };
    } catch (error) {
        console.error("❌ getMailById Error:", error);
        return { status: false, message: "Error fetching mail" };
    }
};

// 🟣 GET ALL
export const getAllEmailConfig = async () => {
    try {
        const mails = await prisma.emailConfig.findMany({
            orderBy: { id: 'desc' },
        });
        return { status: true, mails: serializeBigInt(mails) };
    } catch (error) {
        console.error("❌ getAllMails Error:", error);
        return { status: false, message: "Error fetching mails" };
    }
};
