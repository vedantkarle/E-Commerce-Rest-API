import express from "express";
import { login, logout } from "../controllers/auth/loginController";
import { register } from "../controllers/auth/registerController";
import { profile } from "../controllers/auth/userController";
import { refresh } from "../controllers/auth/refreshController";
import auth from "../middlewares/auth";
import { createProduct } from "../controllers/productController";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", auth, profile);
router.post("/refresh", refresh);

router.post("/product", createProduct);

export default router;
