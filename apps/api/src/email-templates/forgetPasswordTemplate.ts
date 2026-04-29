
import { baseTemplate } from "./baseTemplate"

export const forgetPasswordTemplate = ({ name, resetLink }: { name: string, resetLink: string }) => {
    const content = `
        <h2>Request Password Reset</h2>
        <p>Hi, ${name}</p>
        <p>You have requiesed to reset password</p>
        <a href='${resetLink}'>Reset Password</a>
        <p>This Link will expire in 15 min</p>
        <p>If you have not Request to reset password , please igonre this email</p>
    `

    return baseTemplate({
        title: "",
        content
    })
}