import request, {prepareQuery} from 'src/utils/fetch';
import {PLUGIN} from '../configs/constant';

const getProducts = (query, token) =>
  request.get(`/wcfmmp/v1/products?${prepareQuery(query)}`, {}, token);

const getCategories = (query, token) =>
  request.get(`/${PLUGIN}/v1/categories?${prepareQuery(query)}`, {}, token);

const addProduct = (data, token) => {
  const {image, ...rest} = data;
  const dataAdd =
    image && image.length > 0
      ? {
          ...rest,
          featured_image: {
            src: image,
          },
        }
      : {...rest};
  return request.post(
    '/wcfmmp/v1/products?app-builder-decode=true',
    JSON.stringify(dataAdd),
    'POST',
    token,
  );
};

const updateProduct = (productId, data, token) => {
  const {image, ...rest} = data;
  const dataUpdate = {
    ...rest,
    images: [
      {
        src: image,
      },
    ],
  };
  return request.put(
    `/wcfmmp/v1/products/quick-edit/${productId}?app-builder-decode=true`,
    JSON.stringify(dataUpdate),
    token,
  );
};

const deleteProduct = (id, token) =>
  request.delete(
    `/wcfmmp/v1/products/${id}?app-builder-decode=true`,
    {},
    token,
  );

const getOrders = (query, token) =>
  request.get(`/wcfmmp/v1/orders?${prepareQuery(query)}`, {}, token);

const updateOrders = (idOrder, data, token) =>
  request.put(
    `/wcfmmp/v1/orders/${idOrder}?app-builder-decode=true`,
    JSON.stringify(data),
    token,
  );

const getSales = (query, token) =>
  request.get(`/wcfmmp/v1/sales-stats?${prepareQuery(query)}`, {}, token);

const getDataReport = (query, token) =>
  request.get(
    `/${PLUGIN}/v1/wcfm-report-chart?${prepareQuery(query)}`,
    {},
    token,
  );

const getAllReviews = (query, token) =>
  request.get(`/wcfmmp/v1/reviews?${prepareQuery(query)}`, {}, token);

const getStore = (id, token) =>
  request.get(
    `/wcfmmp/v1/settings/id/${id}?app-builder-decode=true`,
    {},
    token,
  );

const getProfile = (query, token) =>
  request.get(`/wcfmmp/v1/user-profile${prepareQuery(query)}`, {}, token);
const updateProfile = (id, data, token) =>
  request.put(
    `/${PLUGIN}/v1/customers/${id}?app-builder-decode=true`,
    JSON.stringify(data),
    token,
  );
const updateStore = (data = {}, token) =>
  request.post(
    `/${PLUGIN}/v1/wcfm-profile-settings?app-builder-decode=true`,
    JSON.stringify(data),
    'POST',
    token,
  );

export default {
  getProducts,
  getOrders,
  addProduct,
  updateProduct,
  deleteProduct,
  updateOrders,
  getSales,
  getAllReviews,
  getDataReport,
  getStore,
  updateStore,
  getProfile,
  updateProfile,
  getCategories,
};
