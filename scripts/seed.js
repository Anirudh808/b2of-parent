const { Pool } = require("pg");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const cleanConnectionString = (url) => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("sslmode");
    return parsed.toString();
  } catch (e) {
    return url;
  }
};

const url = cleanConnectionString(process.env.DATABASE_URL);
const isLocalDb = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");

const pool = new Pool({
  connectionString: url,
  ssl: isLocalDb ? false : { rejectUnauthorized: false }
});

function hashPasscode(passcode) {
  const salt = "parents_pickup_academy_salt_2026";
  return crypto.createHmac("sha256", salt).update(passcode).digest("hex");
}

async function seed() {
  console.log("Seeding database...");
  const client = await pool.connect();
  try {
    console.log("Cleaning existing database data...");
    await client.query('TRUNCATE TABLE "Kid", "CheckInOutLog", "ParentPasscode", "AdminUser" CASCADE');

    console.log("Inserting Kids...");
    const kids = [
      {
        id: crypto.randomUUID(),
        firstName: "Liam",
        lastName: "Smith",
        age: 6,
        gender: "Male",
        parentName: "Alice Smith",
        parentEmail: "parent@example.com",
        authorizedToPickup: "Alice Smith, Bob Smith (Uncle)",
        parentPhone: "+1 (555) 123-4567",
        emergencyContactName: "Grandma Shirley",
        emergencyContactPhone: "+1 (555) 987-6543",
        notes: "Allergic to peanuts.",
        checkedIn: false,
      },
      {
        id: crypto.randomUUID(),
        firstName: "Emma",
        lastName: "Smith",
        age: 8,
        gender: "Female",
        parentName: "Alice Smith",
        parentEmail: "parent@example.com",
        authorizedToPickup: "Alice Smith, Bob Smith (Uncle)",
        parentPhone: "+1 (555) 123-4567",
        emergencyContactName: "Grandma Shirley",
        emergencyContactPhone: "+1 (555) 987-6543",
        notes: "Wears glasses.",
        checkedIn: true,
      },
      {
        id: crypto.randomUUID(),
        firstName: "Olivia",
        lastName: "Jones",
        age: 7,
        gender: "Female",
        parentName: "Robert Jones",
        parentEmail: "parent2@example.com",
        authorizedToPickup: "Robert Jones, Claire Jones (Aunt)",
        parentPhone: "+1 (555) 321-7654",
        emergencyContactName: "Grandpa Arthur",
        emergencyContactPhone: "+1 (555) 654-0987",
        notes: "",
        checkedIn: false,
      }
    ];

    for (const kid of kids) {
      await client.query(
        `INSERT INTO "Kid" (
          id, "firstName", "lastName", age, gender, "parentName", "parentEmail", 
          "authorizedToPickup", "parentPhone", "emergencyContactName", 
          "emergencyContactPhone", notes, "checkedIn", "lastStatusChange", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())`,
        [
          kid.id, kid.firstName, kid.lastName, kid.age, kid.gender, kid.parentName,
          kid.parentEmail, kid.authorizedToPickup, kid.parentPhone, kid.emergencyContactName,
          kid.emergencyContactPhone, kid.notes, kid.checkedIn
        ]
      );
    }

    console.log("Inserting Parent Passcodes...");
    const passcodes = [
      {
        parentEmail: "parent@example.com",
        passcode: hashPasscode("123456"),
      },
      {
        parentEmail: "parent2@example.com",
        passcode: hashPasscode("654321"),
      }
    ];

    for (const pass of passcodes) {
      await client.query(
        `INSERT INTO "ParentPasscode" (
          id, "parentEmail", passcode, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, NOW(), NOW())`,
        [crypto.randomUUID(), pass.parentEmail, pass.passcode]
      );
    }

    console.log("Inserting Admin User...");
    await client.query(
      `INSERT INTO "AdminUser" (
        id, "fullName", email, password, role, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, 'ADMIN', NOW(), NOW())`,
      [crypto.randomUUID(), "Academy Administrator", "admin@example.com", "888888"]
    );

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
