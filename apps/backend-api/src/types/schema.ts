import z from "zod";



const SignupSchema = z.object({
    email:z.email(),
    password:z.string().min(6).max(12),
    name:z.string().min(3).max(12),
})


const LoginSchema = z.object({
    email:z.email(),
    password:z.string().min(6).max(12),
})
export default {SignupSchema,LoginSchema}