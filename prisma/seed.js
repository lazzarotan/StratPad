/*
* FILE: seed.js
* PROJECT: SET Capstone - Stratpad
* AUTHORS:
* DATE: 03 - 19 - 2026
* DESCRIPTION: Creates dev team admin accounts on first deployment.
*              Run with: npx prisma db seed
*              Default password for all accounts: StratpadDev2026!
*              Change after first login.
*/

import { PrismaClient } from "../src/generated/prisma/index.js";
import { randomUUID } from "crypto";
import { scrypt } from "@noble/hashes/scrypt.js";
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";

const prisma = new PrismaClient();

const DEV_ACCOUNTS =
    [
        { name: "Kalina Cathcart", email: "k.cathcart@stratpad.app", username: "k.cathcart" },
        { name: "Josh Rice", email: "j.rice@stratpad.app", username: "j.rice" },
        { name: "Josh Horsley", email: "j.horsley@stratpad.app", username: "j.horsley" },
        { name: "Christian Tan", email: "c.tan@stratpad.app", username: "c.tan" },
        { name: "Mher Keshishian", email: "m.keshishian@stratpad.app", username: "m.keshishian" },
    ];

// Shared password for all dev accounts
const DEV_PASSWORD = "StratpadDev2026!";



const TEST_USERS = [
    { name: "Alice Johnson", email: "alice@test.com", username: "alicej" },
    { name: "Bob Smith", email: "bob@test.com", username: "bsmith92" },
    { name: "Carol White", email: "carol@test.com", username: "cwhite" },
    { name: "David Brown", email: "david@test.com", username: "davebrown" },
    { name: "Emma Davis", email: "emma@test.com", username: "emmad" },
    { name: "Frank Miller", email: "frank@test.com", username: "fmiller" },
    { name: "Grace Wilson", email: "grace@test.com", username: "gracew" },
    { name: "Henry Moore", email: "henry@test.com", username: "hmoore" },
    { name: "Isabel Taylor", email: "isabel@test.com", username: "isabelt" },
    { name: "James Anderson", email: "james@test.com", username: "janderson" },


    //MY TEST USERS
    { name: "Karen Thomas", email: "karen@test.com", username: "kthomas" },
    { name: "Liam Jackson", email: "liam@test.com", username: "liamj" },
    { name: "Mia Harris", email: "mia@test.com", username: "mharris" },
    { name: "Noah Martin", email: "noah@test.com", username: "nmartin" },
    { name: "Olivia Garcia", email: "olivia@test.com", username: "oliviag" },
    { name: "Peter Martinez", email: "peter@test.com", username: "petermz" },
    { name: "Quinn Robinson", email: "quinn@test.com", username: "quinnr" },
    { name: "Rachel Clark", email: "rachel@test.com", username: "rclark" },
    { name: "Sam Rodriguez", email: "sam@test.com", username: "srodriguez" },
    { name: "Tina Lewis", email: "tina@test.com", username: "tlewis" },
];

// Shared password for all test accounts
const TEST_PASSWORD = "1234";


/*
* FUNCTION: hashPassword
* PARAMETERS: password - plain text password to hash
* RETURNS: string - hashed password in the exact format Better Auth expects
* DESCRIPTION: Uses the same @noble/hashes/scrypt library and parameters
*              that Better Auth uses internally: N=16384, r=16, p=1, dkLen=64
*              with NFKC password normalization. Format is "salt:hashedKey".
*/
function hashPassword(password) {
    const salt = bytesToHex(randomBytes(16));
    const key = scrypt(password.normalize("NFKC"), salt, {
        N: 16384,
        r: 16,
        p: 1,
        dkLen: 64,
    });
    return `${salt}:${bytesToHex(key)}`;
}


/*
* FUNCTION: main
* PARAMETERS: none
* RETURNS: none
* DESCRIPTION: Creates all dev team accounts in the database.
*              Uses upsert so it won't duplicate accounts if run again.
*/
async function main() {
    const hashedPassword = hashPassword(DEV_PASSWORD);

    // admin seeding loop 
    for (const dev of DEV_ACCOUNTS) {
        const userId = randomUUID();
        const accountId = randomUUID();

        await prisma.user.upsert({
            where: { email: dev.email },
            update: {},
            create: {
                id: userId,
                name: dev.name,
                email: dev.email,
                username: dev.username,
                emailVerified: true,
                role: "admin",
                accounts: {
                    create: {
                        id: accountId,
                        accountId: accountId,
                        providerId: "credential",
                        password: hashedPassword,
                    }
                }
            }
        });

        console.log(`Seeded: ${dev.email}`);
    }
}

// Seed test user accounts
const testHashedPassword = hashPassword(TEST_PASSWORD);

for (const user of TEST_USERS) {
    const userId = randomUUID();
    const accountId = randomUUID();

    await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
            id: userId,
            name: user.name,
            email: user.email,
            username: user.username,
            emailVerified: true,
            role: "user",
            accounts: {
                create: {
                    id: accountId,
                    accountId: accountId,
                    providerId: "credential",
                    password: testHashedPassword,
                }
            }
        }
    });

    console.log(`Seeded test user: ${user.email}`);
}


main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });