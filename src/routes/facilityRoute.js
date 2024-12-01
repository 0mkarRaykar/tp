import { Router } from "express";
import {
  createFacility,
  getAllFacility,
  getFacilityById,
  updateFacility,
  deleteFacility,
} from "../controllers/facilityController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/createFacility").post(createFacility);
router.route("/getAllFacility").get(getAllFacility);

router
  .route("/:facilityId")
  .get(getFacilityById)
  .patch(updateFacility)
  .delete(deleteFacility);

export default router;
