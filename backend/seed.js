require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, SchoolClass, Teacher, Student } = require("./models");

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@school.com";
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
      await User.create({
        name: process.env.ADMIN_NAME || "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✔ Default admin created -> email: ${adminEmail} / password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
    } else {
      console.log("Admin already exists, skipping.");
    }

    // Optional: create one demo class so the dashboard isn't empty
    const existingClass = await SchoolClass.findOne();
    if (!existingClass) {
      await SchoolClass.create({
  course_name: "B.Tech",
  course_code: "BT",
  department_name: "Computer Science & Engineering",
  department_code: "CSE",
  section: "A",
});
      console.log("✔ Demo class '10th A' created.");
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
