"use client"
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGetTasksQuery } from '@/redux/apis/employee.api'
import { MoreHorizontalIcon } from 'lucide-react'
import React from 'react'

const page = () => {
  return <>
    <div>Employee Dashboard</div>
    <TaskTable />
  </>

}

const TaskTable = () => {
  const { data } = useGetTasksQuery()

  return <div className='p-4'>
    {
      data && <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>title</TableHead>
            <TableHead>desc</TableHead>
            <TableHead>hero</TableHead>
            <TableHead>due</TableHead>
            <TableHead>complete date</TableHead>
            <TableHead>complete</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            data.result?.map(item => <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell className="font-medium">{item.desc}</TableCell>
              <TableCell className="font-medium">
                {item.hero && <img src={item.hero} height={100} width={100} alt="" />}
              </TableCell>
              <TableCell className="font-medium">{item.due?.toString()}</TableCell>
              <TableCell className="font-medium">{item.completeDate?.toString()}</TableCell>
              <TableCell className="font-medium">
                {
                  item.complete
                    ? <Button variant="secondary">Mark Pending</Button>
                    : <Button variant="secondary">Mark Complete</Button>
                }
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            )
          }
        </TableBody>
      </Table>
    }
  </div>
}

export default page