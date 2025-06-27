import prisma from "@/lib/prisma";

// type PanelType = "admin" | "dropshipper" | "supplier";

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

        // Mapping the database result to the desired output format
        const config = {
            host: emailConfig.smtp_host,
            port: emailConfig.smtp_port,
            secure: emailConfig.smtp_secure,
            username: emailConfig.smtp_username,
            password: emailConfig.smtp_password,
            from_email: emailConfig.from_email,
            from_name: emailConfig.from_name,
        };

        return { status: true, emailConfig: config, htmlTemplate: emailConfig.html_template, subject: emailConfig.subject };
    } catch (error) {
        console.error(`Error fetching email configuration for panel "${panel}", module "${module}", action "${action}":`, error);
        return { status: false, message: "Error fetching email configuration" };
    }
};
