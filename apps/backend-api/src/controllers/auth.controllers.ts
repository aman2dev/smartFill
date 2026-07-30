import "dotenv/config"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { prisma } from "@smartFill/db";


export async function signup(req: Request, res: Response) {
    const user = req.body

    if (!user) {
        return res.status(400).json({ success: false, message: "User not found" })
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email
            }
        })

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const userCreated = await prisma.user.create({
            data: {
                email: user.email,
                password: hashedPassword,
                name: user.name,
            }
        })

        if (!userCreated) {
            return res.status(500).json({ success: false, message: "Failed to create user" })
        }

        return res.status(200).json({ success: true, message: "User created successfully" })


    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}


export async function signin(req: Request, res: Response) {
    const user = req.body

    if (!user) {
        return res.status(400).json({ success: false, message: "User not found" })
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email
            }
        })

        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(user.password, existingUser.password)

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid password" })
        }

        const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET!);

        console.log("token", token)

        return res.status(200).json({ success: true, message: "User signed in successfully", token })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}