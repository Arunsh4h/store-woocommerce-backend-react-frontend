import request from 'src/utils/fetch';
import {PLUGIN} from '../configs/constant';

export const getSetting = () => request.get(`/${PLUGIN}/v1/settings`);

export const fetchCountries = () => request.get('/wc/v3/data/countries');
