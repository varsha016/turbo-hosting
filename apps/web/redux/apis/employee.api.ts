import { APP_URL } from "@/config/env"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { GET_TASK_RESPONSE } from "@repo/types"

export const employeeApi = createApi({
    reducerPath: "employeeApi",
    baseQuery: fetchBaseQuery({ baseUrl: `/api/employee`, credentials: "include" }),
    tagTypes: ["task"],
    endpoints: (builder) => {
        return {
            getTasks: builder.query<GET_TASK_RESPONSE, void>({
                query: () => {
                    return {
                        url: "/tasks",
                        method: "GET"
                    }
                },
                providesTags: ["task"]
            }),
        }
    }
})

export const { useGetTasksQuery } = employeeApi
