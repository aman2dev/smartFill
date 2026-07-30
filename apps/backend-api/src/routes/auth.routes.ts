import { Router } from "express";
import { signin, signup } from "../controllers/auth.controllers";

const router: Router = Router();


router.post("/auth/signup", signup)
router.post("/auth/signin", signin)

export default router;