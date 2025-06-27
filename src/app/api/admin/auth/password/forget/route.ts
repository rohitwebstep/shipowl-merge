import { handleForgetPassword } from '../../../../../controllers/admin/authController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const adminRole = "admin";
    const adminStaffRole = "admin_staff";
    return handleForgetPassword(req, "admin", adminRole, adminStaffRole);
}
