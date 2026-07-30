// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken"



// export function middleware(req: Request, res: Response, next: NextFunction) {
//     const token = req.headers['authorization']
//     if (!token) {
//         return res.status(400).json({ success: false, message: "token not found" })
//     }

//     try {
//         const decodedToken = jwt.verify(token as string, process.env.JWT_SECRET!)
//         console.log(decodedToken)
//         if (!decodedToken) {
//             return res.status(400).json({ success: false, message: "token not valid" })
//         }



//         req.userId = decodedToken as any
//         console.log("userId", req.userId)
//         next()

//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({ success: false, message: "Internal server error" })

//     }
// }




