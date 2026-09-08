/*
* FILE: route.js
* PROJECT: SET Capstone - Stratpad
* AUTHORS:
* DATE: 03 - 19 - 2026
* DESCRIPTION: Admin-only API endpoint. Returns all users and all dashboards.
*              Rejects requests from anyone not in the ADMIN_EMAILS list.
*/

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminConfiguration";



/*
* FUNCTION: GET
* PARAMETERS: none
* RETURNS: JSON object containing all users and dashboards, or an error message
* DESCRIPTION: Fetches all users and all dashboards from the database.
*              Only accessible to users whose email is in the ADMIN_EMAILS list.
*/
export async function GET()
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

        // Fetch all users and a count of their dashboards
        const users = await prisma.user.findMany
        ({

            select:
            {

                id: true,
                name: true,
                email: true,
                username: true,
                createdAt: true,
                role: true, 

                _count:
                {

                    select: { dashboards: true }
                }

            },

            orderBy: { createdAt: "desc" }

        });

        // Fetch all dashboards and include their owner's name and email
        const dashboards = await prisma.dashboard.findMany
        ({

            select:
            {

                dashboardId: true,
                title: true,
                description: true,
                isPublic: true,
                createdAt: true,
                updatedAt: true,

                owner:
                {

                    select:
                    {
                        name: true,
                        email: true,

                    }

                }

            },

            orderBy: { createdAt: "desc" }

        });

        return NextResponse.json({ success: true, users, dashboards });

    }
    catch (err)
    {

        console.error(err);
        return NextResponse.json
        (

            { success: false, error: "Failed to load admin data." },
                { status: 500 }

        );

    }

}