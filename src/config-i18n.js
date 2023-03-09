import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import languages from 'src/locales';
import {DEFAULT_LANGUAGE} from './configs/language';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v2',
  fallbackLng: 'en',
  lng: DEFAULT_LANGUAGE,

  resources: languages,

  ns: ['common'],
  defaultNS: 'common',

  debug: false,
});

export default i18n;
