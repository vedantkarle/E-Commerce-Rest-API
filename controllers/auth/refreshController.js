import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import User from "../../models/User";
import { REFRESH_SECRET } from "../../config";
import RefreshToken from "../../models/RefreshToken";

export const refresh = async (req, res, next) => {
  const refreshSchema = Joi.object({
    refresh_token: Joi.string().required(),
  });

  const { error } = refreshSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  let refreshToken;
  try {
    refreshToken = await RefreshToken.findOne({
      token: req.body.refresh_token,
    });

    if (!refreshToken) {
      return next(CustomErrorHandler.unAuthorized());
    }

    try {
      const { _id } = await JwtService.verify(
        refreshToken.token,
        REFRESH_SECRET
      );

      const user = await User.findOne({ _id });

      if (!user) {
        return next(CustomErrorHandler.unAuthorized("No user found!"));
      }

      //tokens

      const token = JwtService.sign({ _id: user._id, role: user.role });

      const refresh_token = JwtService.sign(
        { _id: user._id, role: user.role },
        "1y",
        REFRESH_SECRET
      );

      //database whitelist

      await RefreshToken.create({ token: refresh_token });

      res.json({ token, refresh_token });
    } catch (error) {}
  } catch (error) {
    return next(error);
  }
};
