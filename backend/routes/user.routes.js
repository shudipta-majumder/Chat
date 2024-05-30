import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getAllUsers, getUsersForSidebar } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/conversations", protectRoute, getUsersForSidebar);
router.get("/allusers", protectRoute, getAllUsers);

export default router;
