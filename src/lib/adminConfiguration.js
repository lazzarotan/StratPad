/*
* FILE: adminConfiguration.js
* PROJECT: SET Capstone - Stratpad
* AUTHORS: 
* DATE: 03 - 19 - 2026
* DESCRIPTION: This file contains the list of admin emails and the function to check if an email is an admin email
*/

// List of admin emails
export const ADMIN_EMAILS =
[

    "k.cathcart@stratpad.app",
    "j.rice@stratpad.app",
    "j.horsley@stratpad.app",
    "c.tan@stratpad.app",
    "m.keshishian@stratpad.app",

];

/*
* FUNCTION: isAdmin
* PARAMETERS: email - the email to check against the list of admin emails
* RETURNS: boolean noting if email is not in the list of admin emails, true otherwise
* DESCRIPTION: checks if the email is in the list of admin emails
*/
export function isAdmin(email)
{

    if (!email)
    {

        return false;

    }

    return ADMIN_EMAILS.includes(email);

}
