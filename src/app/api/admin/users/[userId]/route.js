/*
* FILE: route.js
* PROJECT: SET Capstone - Stratpad
* AUTHORS:
* DATE: 03 - 19 - 2026
* DESCRIPTION: Admin-only API endpoint for user management.
*              DELETE - deletes a user by ID.
*              PATCH  - updates a user's role (e.g. 'user' -> 'admin').
*/

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminConfiguration";



/*
* FUNCTION: DELETE
* PARAMETERS: req - the incoming request object
*             params - contains userId from the URL
* RETURNS: JSON object confirming success, or an error message
* DESCRIPTION: Deletes a user by ID. Also deletes all their dashboards
*              automatically due to the CASCADE rule in the database schema.
*              Only accessible to admins.
*/
export async function DELETE(req, { params }) {
    try {
        // Validate session
        const session = await auth.api.getSession({ headers: await headers() });

        // Reject if not logged in or not an admin
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { userId } = await params;

        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true });

    }
    catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, error: "Failed to delete user." },
            { status: 500 }
        );
    }
}



/*
* FUNCTION: PATCH
* PARAMETERS: req - the incoming request object, expects { role: string } in the body
*             params - contains userId from the URL
* RETURNS: JSON object confirming success, or an error message
* DESCRIPTION: Updates a user's role. Valid roles are "user" and "admin".
*              Only accessible to admins.
*              NOTE: Requires a 'role' field on the User model in schema.prisma.
*              Add: role String @default("user")
*              Then run: npx prisma migrate dev --name add_role_to_user
*/
export async function PATCH(req, { params }) {
    try {
        // Validate session
        const session = await auth.api.getSession({ headers: await headers() });

        // Reject if not logged in or not an admin
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { userId } = await params;
        const body = await req.json();
        const { role } = body;

        // Only allow valid roles
        const validRoles = ["user", "admin"];
        if (!validRoles.includes(role)) {
            return new NextResponse("Invalid role", { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        return NextResponse.json({ success: true });

    }
    catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, error: "Failed to update user role." },
            { status: 500 }
        );
    }
}