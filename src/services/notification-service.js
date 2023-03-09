import request, {prepareQuery} from 'src/utils/fetch';
import {PLUGIN} from '../configs/constant';

export const getNotifications = (query, token) =>
  request.get(`/wcfmmp/v1/notifications?${prepareQuery(query)}`, {}, token);
export const readNotification = (data, token) =>
  request.post(
    `/${PLUGIN}/v1/messages-mark-read?app-builder-decode=true`,
    JSON.stringify(data),
    'POST',
    token,
  );
export const deleteNotification = (data, token) =>
  request.post(
    `/${PLUGIN}/v1/messages-delete?app-builder-decode=true`,
    JSON.stringify(data),
    'POST',
    token,
  );
