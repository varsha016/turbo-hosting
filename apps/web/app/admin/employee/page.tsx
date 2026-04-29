"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeleteEmployeeMutation, useGetEmployeesQuery, useRegisterEmployeeMutation, useRestoreEmployeeMutation, useUpdateEmployeeMutation } from "@/redux/apis/admin.api"
import { zodResolver } from "@hookform/resolvers/zod"
import { Employee, REGISTER_EMPLOYEE_REQUEST } from "@repo/types"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { MoreHorizontalIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export default function EmployeeDashboard() {
    const [show, setShow] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [showEditImage, setShowEditImage] = useState(true)

    const closeDialog = () => {
        setShow(false)
        setSelectedEmployee(null)
        reset({
            name: "",
            email: "",
            mobile: "",
            doj: new Date(),
            dob: new Date(),
            department: "",
            jobRole: "",
        })
    }

    const [createEmployee, { isLoading }] = useRegisterEmployeeMutation()
    const { data } = useGetEmployeesQuery()
    const [deleteEmployee] = useDeleteEmployeeMutation()
    const [restoreEmployee] = useRestoreEmployeeMutation()
    const [update] = useUpdateEmployeeMutation()

    const employeeSchema = z.object({
        name: z.string().min(3),
        mobile: z.string().min(3),
        email: z.string().email(),
        profile: z.instanceof(FileList).optional(),
        department: z.string().min(3),
        jobRole: z.string().min(3),
        doj: z.coerce.date(),
        dob: z.coerce.date(),
    }) satisfies z.ZodType<REGISTER_EMPLOYEE_REQUEST>

    const { register, reset, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(employeeSchema) })
    const handleFormSubmit = async (data: REGISTER_EMPLOYEE_REQUEST) => {
        try {

            const fd = new FormData()
            fd.append("name", data.name)
            fd.append("mobile", data.mobile)
            fd.append("email", data.email)
            fd.append("department", data.department)
            fd.append("jobRole", data.jobRole)
            fd.append("doj", data.doj.toLocaleString())
            fd.append("dob", data.dob.toLocaleString())

            const f = data.profile?.item?.(0)
            if (f) {
                fd.append("profile", f)
            }
            if (selectedEmployee) {
                // update mutation
                await update({ id: selectedEmployee.id, fd }).unwrap()
                setShow(false)
                toast.success("employee update success")
            } else {
                await createEmployee(fd).unwrap()
                setShow(false)
                toast.success("employee register success")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteEmployee({ id }).unwrap()
            toast.success("employee delete success")
        } catch (error) {
            console.log(error)
        }
    }

    const handleRestore = async (id: number) => {
        try {
            await restoreEmployee({ id }).unwrap()
            toast.success("employee restore success")
        } catch (error) {
            console.log(error)
        }
    }


    const handleEdit = (employeeData: Employee) => {
        setShow(true)
        setSelectedEmployee(employeeData)
        reset({
            name: employeeData.name,
            email: employeeData.email,
            mobile: employeeData.mobile,
            doj: format(employeeData.doj as Date, "yyyy-MM-dd") as unknown as Date,
            dob: format(employeeData.dob as Date, "yyyy-MM-dd") as unknown as Date,
            department: employeeData.department as string,
            jobRole: employeeData.jobRole as string,
        })
    }
    return <div >
        <Dialog open={show}>
            <div className="flex justify-end">
                <DialogTrigger asChild >
                    <Button disabled={isLoading} onClick={() => setShow(true)} >Add Employee</Button>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-lg " isLoading={isLoading} closeDialog={closeDialog}  >
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <DialogHeader >
                        {
                            selectedEmployee
                                ? <DialogTitle>Update Employee</DialogTitle>
                                : <DialogTitle>Register Employee</DialogTitle>
                        }

                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader >
                    <FieldGroup className="grid grid-cols-2">
                        <Field>
                            <Label htmlFor="name">Name</Label>
                            <Input disabled={isLoading} {...register("name")} id="name" />
                        </Field>
                        <Field>
                            <Label htmlFor="mobile">mobile</Label>
                            <Input disabled={isLoading} {...register("mobile")} id="mobile" />
                        </Field>
                        <Field>
                            <Label htmlFor="email">email</Label>
                            <Input disabled={isLoading} {...register("email")} id="email" />
                        </Field>
                        <Field>
                            {
                                selectedEmployee && showEditImage
                                    ? <>
                                        <img src={selectedEmployee.profilePic as string} height={100} alt="" />
                                        <Button onClick={() => setShowEditImage(false)} variant={"secondary"}>Change Image</Button>
                                    </>
                                    : <>
                                        <Label htmlFor="profile">profile</Label>
                                        <Input disabled={isLoading} {...register("profile")} id="profile" type="file" />
                                        {!showEditImage && <Button variant="secondary" onClick={() => setShowEditImage(true)}>Cancel</Button>}

                                    </>
                            }
                        </Field>
                        <Field>
                            <Label htmlFor="department">department</Label>
                            <Input disabled={isLoading} {...register("department")} id="department" />
                        </Field>
                        <Field>
                            <Label htmlFor="jobRole">jobRole</Label>
                            <Input disabled={isLoading} {...register("jobRole")} id="jobRole" type="text" />
                        </Field>
                        <Field>
                            <Label htmlFor="doj">doj</Label>
                            <Input disabled={isLoading} type="date" {...register("doj")} id="doj" />
                        </Field>
                        <Field>
                            <Label htmlFor="dob">dob</Label>
                            <Input disabled={isLoading} type="date" {...register("dob")} id="dob" />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button disabled={isLoading} onClick={closeDialog} type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        {
                            selectedEmployee
                                ? <Button type="submit" >Update Employee</Button>
                                : <Button type="submit" disabled={isLoading}>Save changes</Button>
                        }

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        <div className="overflow-x-auto w-full ">
            <Table >
                <TableHeader>
                    <TableRow>
                        <TableHead>id</TableHead>
                        <TableHead>name</TableHead>
                        <TableHead>email</TableHead>
                        <TableHead>mobile</TableHead>
                        <TableHead>department</TableHead>
                        <TableHead>jobrole</TableHead>
                        <TableHead>doj</TableHead>
                        <TableHead>dob</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        data && data.result?.map(item => <TableRow
                            key={item.id}
                            className={`${item.isDelete ? "bg-red-300" : ""}`}>

                            <TableCell >{item.id}</TableCell>
                            <TableCell className="font-medium flex gap-1 items-center">
                                <Avatar>
                                    <AvatarImage src={item.profilePic as string} />
                                </Avatar>
                                {item.name}
                            </TableCell>
                            <TableCell >{item.email}</TableCell>
                            <TableCell >{item.mobile}</TableCell>
                            <TableCell >{item.department}</TableCell>
                            <TableCell >{item.jobRole}</TableCell>
                            <TableCell >{format(item.doj as Date, "yyyy-MM-dd")}</TableCell>
                            <TableCell >{format(item.dob as Date, "yyyy-MM-dd")}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontalIcon />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {
                                            item.isDelete
                                                ? <DropdownMenuItem onClick={() => handleRestore(item.id)} >
                                                    Restore
                                                </DropdownMenuItem>
                                                : <DropdownMenuItem variant="destructive" onClick={() => handleDelete(item.id)} >
                                                    Delete
                                                </DropdownMenuItem>
                                        }

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>)
                    }


                </TableBody>
            </Table>
        </div>

    </div>

}
