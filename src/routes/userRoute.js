import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/getAllUsers").get(getAllUsers);

router.route("/:userId").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
