import request from 'src/utils/fetch';
import {PLUGIN} from '../configs/constant';

export const loginWithEmail = data => request.post(`/${PLUGIN}/v1/login`, data);

export const registerEmail = data =>
  request.post(`/${PLUGIN}/v1/register`, data);

export const settingProfile = (data, token) =>
  request.post(
    `/${PLUGIN}/v1/wcfm-profile-settings?app-builder-decode=true`,
    data,
    'POST',
    token,
  );

export const forgotPassword = data =>
  request.post(`/${PLUGIN}/v1/lost-password`, JSON.stringify(data));

export const getCustomer = customerId =>
  request.get(`/wc/v3/customers/${customerId}`);
