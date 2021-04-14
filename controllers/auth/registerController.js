import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcryptjs";
import JwtService from "../../services/JwtService";
import User from "../../models/User";
import { REFRESH_SECRET } from "../../config";
import RefreshToken from "../../models/RefreshToken";

export const register = async (req, res, next) => {
  // Validation

  const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    confirmPassword: Joi.ref("password"),
  });

  const { error } = registerSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  //check is user exists

  try {
    const user = await User.exists({ email: req.body.email });

    if (user) {
      return next(
        CustomErrorHandler.alreadyExists("This email is already taken!")
      );
    }
  } catch (error) {
    return next(error);
  }

  //Hash password

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  let token;
  let refresh_token;

  try {
    const res = await newUser.save();

    //Token
    token = JwtService.sign({ _id: res._id, role: res.role });

    refresh_token = JwtService.sign(
      { _id: res._id, role: res.role },
      "1y",
      REFRESH_SECRET
    );

    //database whitelist

    await RefreshToken.create({ token: refresh_token });
  } catch (error) {
    return next(error);
  }

  res.json({ token, refresh_token });
};
