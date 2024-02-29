import VendorModel from "../models/vendor.model";

const createVendor = async (data: any): Promise<void> => {
  await VendorModel.create(data);
};

const getVendorByUsernameOrEmail = async (
  username: string,
  email: string
): Promise<any> => {
  const query = { $or: [{ username }, { email: email }] };
  const vendor = await VendorModel.findOne(query).exec();
  return vendor;
};

export { createVendor, getVendorByUsernameOrEmail };
