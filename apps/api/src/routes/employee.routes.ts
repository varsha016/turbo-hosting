import { Router } from "express"
import { getTasks } from "../controllers/employee.controller"
const router = Router()
router.get("/tasks", getTasks)
export default router