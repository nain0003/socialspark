import Campaign from "../models/Campaign.js";

const seed = [
  { title: "Clean Up Canberra Parks",        description: "Help organise volunteers and raise awareness for cleaner public spaces.",          category: "Environment", status: "approved" },
  { title: "Support Local Food Drives",      description: "Connect donors, volunteers, and organisers to support families in need.",         category: "Community",   status: "approved" },
  { title: "Promote Small Local Businesses", description: "Give local businesses a place to share their services and reach more people.",     category: "Business",    status: "approved" },
  { title: "Mental Health Awareness Week",   description: "Share support resources and encourage open conversations in the community.",       category: "Health",      status: "approved" },
  { title: "Youth Skills Workshop",          description: "Create learning opportunities for young people through local mentoring programs.", category: "Education",   status: "approved" },
  { title: "Local Makers Market",            description: "Help small business owners reach more people through a community event.",          category: "Business",    status: "approved" },
];

export const getCampaigns = async (req, res) => {
  try {
    let all = await Campaign.find({ status: "approved" }).sort({ createdAt: -1 });
    if (all.length === 0) all = await Campaign.insertMany(seed);
    const { category } = req.query;
    if (category && category !== "All") all = all.filter(c => c.category === category);
    res.json(all);
  } catch {
    res.status(500).json({ message: "Failed to fetch campaigns." });
  }
};

export const getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch {
    res.status(500).json({ message: "Failed to fetch pending campaigns." });
  }
};

export const createCampaign = async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category)
    return res.status(400).json({ message: "All fields are required." });
  try {
    const campaign = await Campaign.create({
      title, description, category, status: "pending",
      createdBy: req.user._id, authorName: req.user.fullName, authorRole: req.user.role,
    });
    res.status(201).json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to create campaign." });
  }
};

export const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!campaign) return res.status(404).json({ message: "Campaign not found." });
    res.json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to approve campaign." });
  }
};

export const rejectCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!campaign) return res.status(404).json({ message: "Campaign not found." });
    res.json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to reject campaign." });
  }
};
