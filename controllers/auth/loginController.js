import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcryptjs";
import JwtService from "../../services/JwtService";
import User from "../../models/User";
import { REFRESH_SECRET } from "../../config";
import RefreshToken from "../../models/RefreshToken";

export const login = async (req, res, next) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(CustomErrorHandler.wrongCredentials());
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return next(CustomErrorHandler.wrongCredentials());
    }

    const token = JwtService.sign({ _id: user._id, role: user.role });

    const refresh_token = JwtService.sign(
      { _id: user._id, role: user.role },
      "1y",
      REFRESH_SECRET
    );

    //database whitelist

    await RefreshToken.create({ token: refresh_token });

    res.json({ token, refresh_token });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await RefreshToken.deleteOne({ token: req.body.refresh_token });
  } catch (error) {
    return next(error);
  }

  res.json({ message: "Logged out successfully!" });
};
