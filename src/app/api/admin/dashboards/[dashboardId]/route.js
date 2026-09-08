/*
* FILE: route.js
* PROJECT: SET Capstone - Stratpad
* AUTHORS:
* DATE: 03 - 19 - 2026
* DESCRIPTION: Admin-only API endpoint for dashboard management.
*              DELETE - deletes any dashboard by ID regardless of who owns it.
*/

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminConfiguration";



/*
* FUNCTION: DELETE
* PARAMETERS: req - the incoming request object
*             params - contains dashboardId from the URL
* RETURNS: JSON object confirming success, or an error message
* DESCRIPTION: Deletes a dashboard by ID regardless of who owns it.
*              Also deletes all related pages and modules automatically
*              due to the CASCADE rule in the database schema.
*              Only accessible to admins.
*/
export async function DELETE(req, { params })
{

    try
    {

        // Validate session
        const session = await auth.api.getSession({ headers: await headers() });

        // Reject if not logged in or not an admin
        if (!session?.user?.email || !isAdmin(session.user.email))
        {

            return new NextResponse("Forbidden", { status: 403 });

        }

        const { dashboardId } = await params;

        await prisma.dashboard.delete
        ({

                where: { dashboardId }

        });

        return NextResponse.json({ success: true });

    }
    catch (err)
    {

        console.error(err);
        return NextResponse.json
        (

            { success: false, error: "Failed to delete dashboard." },
            { status: 500 }
        );

    }

}