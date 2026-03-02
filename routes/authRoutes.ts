import express, { type RequestHandler } from "express";
import User from '../models/userSchema.js'
import { JWT_SECRET } from "../utilities/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { check, validationResult } from 'express-validator'
import { auth } from "../middleware/auth.js";

const router = express.Router()

// @route: POST /api/auth
// @desc: login USER
// @access: Public


router
    .route('/')

    .post(
        [
            check("email", "Please include a valid email").isEmail(),
            check("password", "Password required").not().isEmpty()
        ],
        (async (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { email, password } = req.body

            try {
                // find user by email
                let user = await User.findOne({ email })

                // If no user, res with error
                if (!user) return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });

                // compare password with DB password
                const isMatch = await bcrypt.compare(password, user.password)

                // if no match, return error
                if (!isMatch) return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });

                // create payload for jwt
                const payload = {
                    user: {
                        id: user._id
                    }
                }

                // sign and send JWT in response
                jwt.sign(
                    payload,
                    JWT_SECRET,
                    { expiresIn: "3h" },
                    (err, token) => {
                        if (err) throw err

                        res.json({ token })
                    }
                )
            } catch (error: any) {
                console.error(error.message)
                res.status(500).json({ errors: error.message })
            }

        }) as RequestHandler
    )


    .get(auth, (async (req, res) => {
        if (!req.user?.id) {
            return res.status(401).json({ errors: [{ msg: "Not authorized" }] });
        }
        const user = await User.findById(req.user.id).select("-password");
        res.json(user)
    }) as RequestHandler)


export default router