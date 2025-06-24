import express from 'express';
import { postJob, getAllJobs,applyForJob,getAllApplicants,deleteApplicant,deleteJob} from '../controllers/jobController.js';
import upload from "../middleware/upload.js";
import path from "path";
import fs from "fs"


const router = express.Router();
const __dirname = path.resolve();

router.get('/resume/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('File not found');
    res.sendFile(filePath);
  });
});

router.post('/post-job', postJob); // POST route to save job


router.get('/', getAllJobs); // fetch jobs 

router.post("/apply", upload.single("resume"), applyForJob); // handles file upload


router.get("/all-applicants", getAllApplicants);
router.delete("/applications/:id", deleteApplicant); 
router.delete("/delete/:id", deleteJob);


export default router;
