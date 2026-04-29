import { Request, Response } from "express"
import db from "../config/db"
import { task } from "../models"
import { eq } from "drizzle-orm"
import { GET_TASK_REQUEST, GET_TASK_RESPONSE } from "@repo/types"

interface AuthRequest extends Request {
    user: number,
}
export const getTasks = async (mreq: Request<{}, {}, GET_TASK_REQUEST>, res: Response<GET_TASK_RESPONSE>) => {
    try {
        //                                                               👇 replace dynamically
        const req = mreq as AuthRequest
        const result = await db.select().from(task).where(eq(task.userId, req.user))
        res.status(200).json({ message: "task fetch success", result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "unable to profile update server error" })
    }
}
