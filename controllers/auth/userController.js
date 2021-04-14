import User from "../../models/User";
import CustomErrorHandler from "../../services/CustomErrorHandler";

export const profile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select(
      "-password -__v -_id"
    );

    if (!user) {
      return next(CustomErrorHandler.notFound());
    }

    res.json(user);
  } catch (error) {
    return next(error);
  }
};
