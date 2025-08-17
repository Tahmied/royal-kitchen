import { Router } from "express";
import { submitLead } from "../controllers/lead.controller";

const router = Router()

router.post('/submitLead' , submitLead)

export default router