import type { Task } from "./admin"

export type GET_TASK_REQUEST = void
export type GET_TASK_RESPONSE = {
    message: string
    result?: Task[]
}
