import { Router } from "express";
import {
  confirmCheckoutSession,
  createCheckoutSession,
} from "../controllers/paymentController";
import { authenticated } from "../middleware/auth";

const router = Router();

router.use(authenticated);

router.post("/checkout-session", createCheckoutSession);
router.post("/confirm-session", confirmCheckoutSession);

export default router;

