require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));
app.use("/uploads", express.static("uploads"));

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ==========================================
// PORTION 2: DATABASE CONNECTION
// PostgreSQL Pool Setup
// ==========================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
.then(() => console.log("✅ PostgreSQL connected"))
.catch(err => console.log(err));

// ==========================================
// PORTION 3: OTP GENERATOR
// OTP Logic Function
// ==========================================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


// ==========================================
// PORTION 4: EMAIL CONFIGURATION
// Nodemailer Setup (Gmail)
// ==========================================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



// ==========================================
// PORTION 5: OTP ROUTES
// Send OTP & Verify OTP APIs
// ==========================================
app.post("/send-otp", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        const otp = generateOTP();

        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            `INSERT INTO otp_store(email, otp_code, otp_expires_at)
             VALUES($1,$2,$3)
             ON CONFLICT(email)
             DO UPDATE SET otp_code=$2, otp_expires_at=$3`,
            [email, otp, expires]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "GDEH OTP Verification",
            html: `<h2>Your OTP is: ${otp}</h2>`
        });

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});



// ==========================================
// PORTION 6: OTP VERIFICATION
// ==========================================

app.post("/verify-otp", async (req, res) => {
    try {

        const email = req.body.email?.trim().toLowerCase();
        const otp = req.body.otp?.trim();

        const result = await pool.query(
            `SELECT * FROM otp_store
             WHERE LOWER(email)=LOWER($1)
             AND otp_code=$2`,
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const otpData = result.rows[0];

        if (new Date() > new Date(otpData.otp_expires_at)) {
            return res.json({
                success: false,
                message: "OTP expired"
            });
        }

        res.json({
            success: true,
            message: "OTP verified"
        });

    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "OTP verification failed"
        });
    }
});


// ==========================================
// PORTION 7: STUDENT SIGNUP
// ==========================================


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

app.post("/signup", upload.single("profile_photo"), async (req, res) => {

    try {

        const {
            full_name,
            phone,
            email,
            address,
            county,
            zip_code,
            course,
            username,
            password,
            otp
        } = req.body;

        // VERIFY OTP
        const otpCheck = await pool.query(
            `SELECT * FROM otp_store
             WHERE LOWER(email)=LOWER($1)
             AND otp_code=$2`,
            [email.trim().toLowerCase(), otp.trim()]
        );

        if (otpCheck.rows.length === 0) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (new Date() > new Date(otpCheck.rows[0].otp_expires_at)) {
            return res.json({ success: false, message: "OTP expired" });
        }

        // CHECK EMAIL
        const emailExists = await pool.query(
            `SELECT * FROM signup_table WHERE email=$1`,
            [email]
        );

        if (emailExists.rows.length > 0) {
            return res.json({
                success: false,
                message: "Email already exists"
            });
        }

        // HASH PASSWORD
        const bcrypt = require("bcryptjs");
        const hashed = await bcrypt.hash(password, 10);

        // PROFILE PHOTO
        let photoPath = "";
        if (req.file) {
            photoPath = req.file.path;
        }

        // INSERT USER
        await pool.query(
            `INSERT INTO signup_table(
                full_names,
                phone_number,
                email,
                address,
                county,
                zip_code,
                course,
                profile_photo,
                create_username,
                create_password,
                role
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'student')`,
            [
                full_name,
                phone,
                email,
                address,
                county,
                zip_code,
                course,
                photoPath,
                username,
                hashed
            ]
        );

        await pool.query(
            `DELETE FROM otp_store WHERE email=$1`,
            [email]
        );

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Signup failed" });
    }
});


// ==========================================
// PORTION 8: LOGIN SYSTEM
// ==========================================

app.post("/login", async (req, res) => {

    try {

        const username = req.body.username?.trim();
        const password = req.body.password?.trim();

        const result = await pool.query(
            `SELECT * FROM signup_table WHERE create_username=$1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "Invalid username"
            });
        }

        const user = result.rows[0];

        const bcrypt = require("bcryptjs");
        const valid = await bcrypt.compare(password, user.create_password);

        if (!valid) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.create_username,
                role: user.role
            }
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Login failed" });
    }
});


// ==========================================
// PORTION 9: STUDENT DASHBOARD DATA
// ==========================================

app.get("/dashboard-data/:id", async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.json({
                success: false,
                message: "Invalid ID"
            });
        }

        const user = await pool.query(
            `SELECT * FROM signup_table WHERE id=$1`,
            [id]
        );

        const fees = await pool.query(
            `SELECT * FROM fees_table WHERE student_id=$1`,
            [id]
        );

        const transcript = await pool.query(
            `SELECT * FROM transcript_table WHERE student_id=$1 ORDER BY id DESC LIMIT 1`,
            [id]
        );

        const timetable = await pool.query(
    `SELECT * FROM timetable_table ORDER BY id DESC LIMIT 1`
);

        const examCard = await pool.query(
            `SELECT * FROM examcard_table WHERE student_id=$1 ORDER BY id DESC LIMIT 1`,
            [id]
        );

        const assignments = await pool.query(
            `SELECT * FROM assignment_table WHERE student_id=$1 ORDER BY id DESC`,
            [id]
        );

        const announcements = await pool.query(
            `SELECT * FROM announcements_table ORDER BY id DESC`
        );

        res.json({
            success: true,
            user: user.rows[0],
            fees: fees.rows,
            transcript: transcript.rows[0],
            timetable: timetable.rows[0],
            examCard: examCard.rows[0],
            assignments: assignments.rows,
            announcements: announcements.rows
        });

    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "Dashboard failed"
        });
    }
});

// ==========================================
// PORTION 10: HOME ROUTE
// ==========================================


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ==========================================
// PORTION 11: ADMIN SECURITY CHECK
// ==========================================

function isAdmin(req, res, next) {

    // In future we will use JWT/session
    // For now we check role from request body (simple version)

    const role = req.body.role || req.query.role;

    if (role !== "admin") {
        return res.json({
            success: false,
            message: "Access denied (Admin only)"
        });
    }

    next();
}


// ==========================================
// PORTION 12: ADMIN UPLOAD TRANSCRIPT
// ==========================================

app.post(
"/admin/upload-transcript",
upload.single("transcript_file"),
async (req, res) => {

    try {

        const { student_id } = req.body;

        await pool.query(
            `INSERT INTO transcript_table(student_id, transcript_file)
             VALUES($1,$2)`,
            [student_id, req.file.path]
        );

        res.json({
            success: true,
            message: "Transcript uploaded"
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});


// ==========================================
// PORTION 13: ADMIN UPLOAD TIMETABLE
// ==========================================

app.post(
"/admin/upload-timetable",
upload.single("timetable_file"),
async (req, res) => {

    try {

        const { student_id } = req.body;

        await pool.query(
            `INSERT INTO timetable_table(student_id, timetable_file)
             VALUES($1,$2)`,
            [student_id, req.file.path]
        );

        res.json({
            success: true,
            message: "Timetable uploaded"
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});

// ==========================================
// PORTION 14: ADMIN UPLOAD EXAM CARD
// ==========================================

app.post(
"/admin/upload-exam-card",
upload.single("examcard_file"),
async (req, res) => {

    try {

        const { student_id } = req.body;

        await pool.query(
            `INSERT INTO examcard_table(student_id, exam_card_file)
             VALUES($1,$2)`,
            [student_id, req.file.path]
        );

        res.json({
            success: true,
            message: "Exam card uploaded"
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});


// ==========================================
// PORTION 15: ADMIN ASSIGNMENTS
// ==========================================

app.post(
"/admin/upload-assignment",
upload.single("assignment_file"),
async (req, res) => {

    try {

        const { student_id, title } = req.body;

        await pool.query(
            `INSERT INTO assignment_table(
                student_id,
                assignment_title,
                assignment_file
            )
            VALUES($1,$2,$3)`,
            [student_id, title, req.file.path]
        );

        res.json({
            success: true,
            message: "Assignment uploaded"
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});


// ==========================================
// PORTION 16: ADMIN ANNOUNCEMENTS
// ==========================================

app.post(
"/admin/post-announcement",
async (req, res) => {

    try {

        const { title, message } = req.body;

        await pool.query(
            `INSERT INTO announcements_table(title, message)
             VALUES($1,$2)`,
            [title, message]
        );

        res.json({
            success: true,
            message: "Announcement posted"
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});


// ==========================================
// PORTION 17: ADMIN VIEW STUDENTS
// ==========================================

app.get("/admin/students", async (req, res) => {

    try {

        const result = await pool.query(
`
SELECT
id,
full_names,
email,
course,
role,
profile_photo
FROM signup_table
ORDER BY id DESC
`
);

        res.json({
            success: true,
            students: result.rows
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});

// ==========================================
// PORTION 18: LOAD STUDENT UNITS
// ==========================================

app.get("/student/units/:id", async (req, res) => {

    try {

        const studentId =
        parseInt(req.params.id);

        // =========================
        // GET STUDENT
        // =========================
        const student =
        await pool.query(
            `SELECT * FROM signup_table
             WHERE id=$1`,
            [studentId]
        );

        if(student.rows.length === 0){

            return res.json({
                success:false,
                message:"Student not found"
            });

        }

        const courseName =
        student.rows[0].course;

        // =========================
        // GET COURSE ID
        // =========================
        const course =
        await pool.query(
            `SELECT * FROM course_table
             WHERE course_name=$1`,
            [courseName]
        );

        if(course.rows.length === 0){

            return res.json({
                success:false,
                message:"Course not found"
            });

        }

        const courseId =
        course.rows[0].id;

        // =========================
        // GET UNITS
        // =========================
        const units =
        await pool.query(
            `SELECT *
             FROM units_table
             WHERE course_id=$1
             ORDER BY unit_code ASC`,
            [courseId]
        );

        res.json({

            success:true,

            student:
            student.rows[0],

            units:
            units.rows

        });

    }

    catch(err){

        console.log(err);

        res.json({
            success:false
        });

    }

});
// ==========================================
// PORTION 19: REGISTER UNIT
// ==========================================

app.post("/register-unit", async (req, res) => {

    try {

        const {
            student_id,
            unit_id
        } = req.body;

        // =========================
        // CHECK EXISTING
        // =========================
        const existing =
        await pool.query(
            `SELECT * FROM student_units
             WHERE student_id=$1
             AND unit_id=$2`,
            [student_id, unit_id]
        );

        if(existing.rows.length > 0){

            return res.json({
                success:false,
                message:"Unit already registered"
            });

        }

        // =========================
        // INSERT
        // =========================
        await pool.query(
            `INSERT INTO student_units(
                student_id,
                unit_id
            )
            VALUES($1,$2)`,
            [student_id, unit_id]
        );

        res.json({
            success:true
        });

    }

    catch(err){

        console.log(err);

        res.json({
            success:false
        });

    }

});

app.post("/reset-password", async (req,res)=>{

  const { token, newPassword } = req.body;

  try{

    const user = await pool.query(
      `SELECT * FROM signup_table
       WHERE reset_token=$1
       AND reset_token_expiry > NOW()`,
      [token]
    );

    if(user.rows.length === 0){
      return res.json({
        success:false,
        message:"Invalid or expired token"
      });
    }

    await pool.query(
      `UPDATE signup_table
       SET create_password=$1,
           reset_token=NULL,
           reset_token_expiry=NULL
       WHERE reset_token=$2`,
      [newPassword, token]
    );

    res.json({
      success:true,
      message:"Password reset successful"
    });

  }catch(err){

    console.log(err);

    res.json({
      success:false,
      message:"Server error"
    });

  }

});
