import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "../src/config/env.js";
import { Admin } from "../src/models/Admin.js";

const email = "admin@admin.com";
const password = "Admin@123";

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email before creating an admin");
}
// if (!password || password.length < 12 || password.length > 200) {
//     throw new Error("Set ADMIN_PASSWORD to a password between 12 and 200 characters");
// }

try {
    await mongoose.connect(config.MONGODB_URI);
    const existing = await Admin.exists({ email });
    if (existing) throw new Error(`An admin account already exists for ${email}`);

    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ email, passwordHash });
    console.log(`Created admin account for ${email}`);
} finally {
    await mongoose.disconnect();
}
