import express from "express";
import { getCampaigns, getPendingCampaigns, createCampaign, approveCampaign, rejectCampaign } from "../controllers/campaignController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.get("/",            getCampaigns);
router.get("/pending",     protect, adminOnly, getPendingCampaigns);
router.post("/",           protect, createCampaign);
router.put("/:id/approve", protect, adminOnly, approveCampaign);
router.put("/:id/reject",  protect, adminOnly, rejectCampaign);
export default router;
