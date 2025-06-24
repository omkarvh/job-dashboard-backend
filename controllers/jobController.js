import pool from '../config/db.js';
import path from "path";
import fs from "fs";

export const getAllJobs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
    res.status(200).json({ jobs: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

export const postJob = async (req, res) => {
  const {
    title,
    company,
    description,
    salary_range,
    openings,
    skills,
    experience,
    location
  } = req.body;
console.log("Incoming job data:", req.body);
  try {
    const result = await pool.query(
      `INSERT INTO jobs 
       (title, company, description, salary_range, openings, skills, experience, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, company, description, salary_range, openings, skills, experience, location]
    );

    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to post job' });
  }

  
};

export const applyForJob = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      experience,
      currentSalary,
      expectedSalary,
    } = req.body;

    const job_id = req.body.job_id;
    const resume = req.file;

    if (!resume) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // Size check: 5MB max
    if (resume.size > 5 * 1024 * 1024) {
      fs.unlinkSync(resume.path); // delete file if too large
      return res.status(400).json({ message: "Resume exceeds 5MB limit" });
    }

    const result = await pool.query(
      `INSERT INTO job_applications 
        (job_id, name, email, phone, experience, current_salary, expected_salary, resume_filename)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        job_id,
        name,
        email,
        phone,
        experience,
        currentSalary,
        expectedSalary,
        resume.filename,
      ]
    );

    res.status(201).json({ message: "Application submitted", id: result.rows[0].id });
  } catch (err) {
    console.error("Application error:", err.message);
    res.status(500).json({ message: "Application failed" });
  }
};



export const getAllApplicants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ja.id, ja.name, ja.email, ja.resume_filename, ja.applied_at, j.title AS job_title
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      ORDER BY ja.applied_at DESC
    `);
    res.status(200).json({ applicants: result.rows });
  } catch (err) {
    console.error("❌ Error in getAllApplicants:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deleteApplicant = async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: Get resume file name if you want to delete the uploaded file
    const fileResult = await pool.query("SELECT resume_filename FROM job_applications WHERE id = $1", [id]);

    if (fileResult.rows.length > 0) {
      const fileName = fileResult.rows[0].resume_filename;
      const filePath = `./uploads/${fileName}`;
      // Delete file if exists
      import('fs').then(fs => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete file:", err.message);
        });
      });
    }

    // Delete from DB
    await pool.query("DELETE FROM job_applications WHERE id = $1", [id]);
    res.status(200).json({ message: "Applicant deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete applicant" });
  }
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting job:", err.message);
    res.status(500).json({ error: "Failed to delete job" });
  }
};

