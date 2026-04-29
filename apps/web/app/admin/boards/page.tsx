"use client"
import React, { useState } from 'react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core"
import { useCreateTaskMutation, useDeleteTaskMutation, useFetchTaskQuery, useGetEmployeesQuery, useUpdateTaskDetailsMutation, useUpdateTaskMutation } from '@/redux/apis/admin.api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CREATE_TASK_REQUEST, Employee, Task, UPDATE_TASK_DETAILS_REQUEST } from '@repo/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

const page = () => {
    const { data } = useGetEmployeesQuery()
    const { data: taskData } = useFetchTaskQuery()

    const [updateTask] = useUpdateTaskMutation()

    const handleDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e

        const { id: taskId } = active // taskId = 8
        const employeeId = over?.id // employeeId= 2
        // const index = tasks.findIndex(item => item.id === taskId)

        const singleTask = taskData && taskData.result?.find(item => item.id === taskId)
        if (singleTask) {

            if (employeeId === singleTask.userId) return // 👈 to avoid update onClick 

            await updateTask({ taskId: singleTask.id, userId: employeeId as number }).unwrap()
            toast.success("task update")
            // singleTask.eid = employeeId as number
            // console.log(tasks)
        }
    }

    return <DndContext onDragEnd={handleDragEnd}>
        <div className='flex gap-2'>
            {
                data && taskData && taskData.result && data.result?.map(item => <Column item={item} key={item.id} tasks={taskData?.result as Task[]} />)
            }

        </div>
    </DndContext>
}

const Column = ({ item, tasks }: { item: Employee, tasks: Task[] }) => {

    const [showBtn, setShowBtn] = useState(false)

    const { setNodeRef, active } = useDroppable({ id: item.id })
    const [createTask] = useCreateTaskMutation()
    const taskSchema = z.object({
        title: z.string().min(2),
        userId: z.number(),
    }) satisfies z.ZodType<CREATE_TASK_REQUEST>

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            userId: item.id
        }
    })

    const handleFormSubmit = async (taskData: CREATE_TASK_REQUEST) => {
        try {
            await createTask(taskData).unwrap()
            toast.success("task create success")
            reset()
            setShowBtn(false)
        } catch (error) {
            console.log(error)
        }
    }

    return <div className=' flex-1'>
        <Card ref={setNodeRef} className='overflow-visible' >
            <CardHeader>
                <CardTitle >{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
                {
                    tasks.map(t => t.userId === item.id && <TaskCard t={t} key={t.id} />)
                }
            </CardContent>
            <CardFooter className='mt-auto flex-col'>
                {
                    showBtn
                        ? <div>
                            <form onSubmit={handleSubmit(handleFormSubmit)}>
                                <Input {...register("title")}
                                    placeholder='Enter Task'
                                    className='w-full mb-2'
                                    aria-invalid={errors.title?.message ? true : false} />
                                <Button type='submit' className='me-2' >Add</Button>
                                <Button type='button' onClick={() => setShowBtn(false)} variant="secondary">Cancel</Button>
                            </form>
                        </div>
                        : <Button onClick={() => setShowBtn(true)} className='w-full'>Add a Card</Button>
                }
            </CardFooter>

        </Card>
    </div>
}

const TaskCard = ({ t }: { t: Task }) => {

    const [updateDetails, { isLoading: updateLoading }] = useUpdateTaskDetailsMutation()
    const [deleteTask, { isLoading: deleteLoading }] = useDeleteTaskMutation()

    const taskDetailSchema = z.object({
        title: z.string().min(3),
        desc: z.string(),
        hero: z.instanceof(FileList),
        due: z.coerce.date(),
    }) satisfies z.ZodType<UPDATE_TASK_DETAILS_REQUEST>

    const { setValue, register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(taskDetailSchema)
    })

    const [show, setShow] = useState(false)
    const { attributes, transform, setNodeRef, listeners } = useDraggable({ id: t.id })
    const [date, setDate] = React.useState<Date>()
    const customeStyle = {
        transform: `translate(${transform?.x}px, ${transform?.y}px)`
    }

    const handleClose = () => {
        setShow(false)
    }
    const handleFormSubmit = async (taskData: UPDATE_TASK_DETAILS_REQUEST) => {
        try {
            const fd = new FormData()
            fd.append("title", taskData.title)
            if (taskData.desc) fd.append("desc", taskData.desc)
            if (taskData.due) fd.append("due", taskData.due.toISOString())
            if (taskData.hero?.item(0)) fd.append("hero", taskData.hero?.item(0) as File)
            await updateDetails({ id: t.id, fd }).unwrap()
            toast.success("task update success")
            setShow(false)
        } catch (error) {
            console.log(error)
        }
    }
    const handleDelete = async () => {
        try {
            await deleteTask({ id: t.id }).unwrap()
            toast.success("task delete scucess")
            setShow(false)
        } catch (error) {
            console.log(error)
        }
    }

    const handleShowAndReset = () => {
        setShow(true)
        reset({
            title: t.title,
            desc: t.desc as string,
            due: t.due as Date,
        })
    }
    return <>
        <Card style={customeStyle} className='mb-2 cursor-grab ' onClick={handleShowAndReset}>
            <div  {...attributes}  {...listeners} ref={setNodeRef} >
                {
                    t.hero && <img
                        src={t.hero}
                        alt="Event cover"
                        className=""
                    />
                }

                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
            </div>
        </Card>


        {/* dialog */}
        <Dialog open={show}>
            <DialogContent className="sm:max-w-sm" closeDialog={handleClose}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="title">Task</Label>
                            <Input {...register("title")} id="title" name="title" />
                        </Field>
                        <Field>
                            <Label htmlFor="desc">Description</Label>
                            <Input {...register("desc")} id="desc" />
                        </Field>
                        <Field>
                            <Label htmlFor="hero">Hero Image</Label>
                            <Input type='file' {...register("hero")} id="hero" />
                        </Field>
                        <Field>
                            <Label htmlFor="due-date">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!date}
                                        className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(x) => {
                                            setValue("due", new Date(x as Date), {
                                                shouldValidate: true
                                            })
                                            setDate(x)
                                        }}
                                        defaultMonth={date}
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>
                    </FieldGroup>
                    <DialogFooter className='mt-4'>
                        <Button onClick={handleDelete} type="button" variant="destructive">Delete Task</Button>
                        <DialogClose asChild>
                            <Button type='button' onClick={handleClose} variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
}

export default page