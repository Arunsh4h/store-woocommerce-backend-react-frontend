/**
 * Store Manager App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';

import OneSignal from 'react-native-onesignal';
import {
  ActivityIndicator,
  I18nManager,
  StatusBar,
  StyleSheet,
  View,
  LogBox,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import includes from 'lodash/includes';
import moment from 'moment';
import SplashScreen from 'react-native-splash-screen';
import FlashMessage from 'react-native-flash-message';
import AsyncStorage from '@react-native-community/async-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import GettingStartScreen from './src/screens/getting-start';
import HomeScreen from './src/screens/home';
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/register';
import StoreSetupScreen from './src/screens/store-setup';
import StoreSetupDokanScreen from './src/screens/store-setup-dokan';
import PaymentSetupScreen from './src/screens/payment_setup';
import PolicySetupScreen from './src/screens/policy_setup';
import SupportSetupScreen from './src/screens/support_setup';
import SeoSetupScreen from './src/screens/seo_setup';
import SocialSetupScreen from './src/screens/social_setup';
import ReadySetupScreen from './src/screens/ready_setup';
import ForgotPasswordScreen from './src/screens/forgot_password';
import ProductScreen from './src/screens/product';
import ChatScreen from './src/screens/chat';
import OrderScreen from './src/screens/order';
import AccountScreen from './src/screens/account';
import FormProductScreen from './src/screens/form-product';
import ReviewScreen from './src/screens/review';
import ReviewDetailScreen from './src/screens/review-detail';
import NotificationScreen from './src/screens/notification';
import OrderDetailScreen from './src/screens/order-detail';
import SettingStoreScreen from './src/screens/setting-store';
import UpdateStoreScreen from './src/screens/update-store';
import UpdatePersonScreen from './src/screens/update_person';
import UpdateAddressScreen from './src/screens/update_address';
import UpdateSocialScreen from './src/screens/update_social';
import UpdatePaymentScreen from './src/screens/update_payment';
import ChatVendorDetailScreen from './src/screens/chat_detail';
import ReportScreen from './src/screens/report';

import TabBar from './src/containers/TabBar';

import {AuthContext} from './src/utils/auth-context';
import {themeLight, themeDark} from './src/configs/themes';
import {loginWithEmail} from './src/services/auth-service';
import {getSetting, fetchCountries} from './src/services/common-service';

import {showMessage} from './src/utils/message';
import {PLUGIN_VENDOR_INSTALLED, DOKAN} from './src/services/index';

import './src/config-i18n';
import {ONE_SIGNAL_APP_ID} from './src/configs/constant';
import RNRestart from 'react-native-restart';
import {DEFAULT_LANGUAGE} from './src/configs/language';
import {useState} from 'react';

/**
 *
 * The new version, of react-native-gesture-handler send warning because package/library use it.
 *
 * https://stackoverflow.com/questions/70743721/remove-warning-react-native-gesture-handler-seems-like-youre-using-an-old-a/70768104
 */
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const regex = /(<([^>]+)>)/gi;

const options = {
  headerShown: false,
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={options}>
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    <Stack.Screen name="StoreSetupScreen" component={StoreSetupScreen} />
    <Stack.Screen name="PaymentSetupScreen" component={PaymentSetupScreen} />
    <Stack.Screen name="PolicySetupScreen" component={PolicySetupScreen} />
    <Stack.Screen name="SupportSetupScreen" component={SupportSetupScreen} />
    <Stack.Screen name="SeoSetupScreen" component={SeoSetupScreen} />
    <Stack.Screen name="SocialSetupScreen" component={SocialSetupScreen} />
    <Stack.Screen name="ReadySetupScreen" component={ReadySetupScreen} />
    <Stack.Screen
      name="ForgotPasswordScreen"
      component={ForgotPasswordScreen}
    />
  </Stack.Navigator>
);
const AuthStackDokan = () => (
  <Stack.Navigator screenOptions={options}>
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    <Stack.Screen name="StoreSetupScreen" component={StoreSetupDokanScreen} />
    <Stack.Screen
      name="ForgotPasswordScreen"
      component={ForgotPasswordScreen}
    />
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator screenOptions={options}>
    <Stack.Screen name="AccountScreen" component={AccountScreen} />
    <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
    <Stack.Screen name="ReviewDetailScreen" component={ReviewDetailScreen} />
    <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
  </Stack.Navigator>
);

function MainTab() {
  return (
    <Tab.Navigator tabBar={props => <TabBar {...props} />}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="ProductScreen"
        component={ProductScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="OrderScreen"
        component={OrderScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="AccountStack"
        component={AccountStack}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  const {i18n} = useTranslation();

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            isLoading: false,
            userToken: action.token,
            user: action.user,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isLoading: true,
          };
        case 'SIGN_IN_SUCCESS':
          return {
            ...prevState,
            isLoading: false,
            userToken: action.token,
            user: action.user,
          };
        case 'SIGN_IN_ERROR':
          return {
            ...prevState,
            isLoading: false,
            error: action.error,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignOut: true,
            userToken: null,
            user: {},
            error: null,
          };
        case 'SET_THEME':
          return {
            ...prevState,
            theme: action.theme,
          };
        case 'SET_LANGUAGE':
          return {
            ...prevState,
            language: action.language,
          };
        case 'CLOSE_GETTING_START':
          return {
            ...prevState,
            isGetting: false,
          };
        case 'SET_CURRENCY':
          return {
            ...prevState,
            currency: action.payload.currency,
            positionCurrency: action.payload.positionCurrency,
          };
        case 'GET_COUNTRIES':
          return {
            ...prevState,
            loadingCountry: true,
          };
        case 'GET_COUNTRIES_SUCCESS':
          return {
            ...prevState,
            countries: action.countries,
            expireCountry: moment().add(30, 'm').unix(),
            loadingCountry: false,
          };
        case 'GET_COUNTRIES_ERROR':
          return {
            ...prevState,
            loadingCountry: false,
          };
        case 'UPDATE_LOADING_NOTIFICATION':
          return {
            ...prevState,
            loadingNotification: prevState.loadingNotification + action.payload,
          };
      }
    },
    {
      isLoading: false,
      isSignOut: false,
      isGetting: true,
      userToken: null,
      user: {},
      theme: 'light',
      language: DEFAULT_LANGUAGE,
      currency: 'USD',
      positionCurrency: 'left',
      countries: [],
      expireCountry: '',
      loadingCountry: false,
    },
  );

  React.useEffect(() => {
    OneSignal.setAppId(ONE_SIGNAL_APP_ID);

    // O N E S I G N A L   S E T U P
    OneSignal.setLogLevel(6, 0);
    OneSignal.setRequiresUserPrivacyConsent(false);
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log('Prompt response:', response);
    });

    /* O N E S I G N A L  H A N D L E R S */
    OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
      console.log(
        'OneSignal: notification will show in foreground:',
        notifReceivedEvent,
      );
    });
    OneSignal.setNotificationOpenedHandler(notification => {
      console.log('OneSignal: notification opened:', notification);
      dispatch({
        type: 'UPDATE_LOADING_NOTIFICATION',
        payload: 1,
      });
    });
    OneSignal.setInAppMessageClickHandler(event => {
      console.log('OneSignal IAM clicked:', event);
    });
    OneSignal.addEmailSubscriptionObserver(event => {
      console.log('OneSignal: email subscription changed: ', event);
    });
    OneSignal.addSubscriptionObserver(event => {
      console.log('OneSignal: subscription changed:', event);
    });
    OneSignal.addPermissionObserver(event => {
      console.log('OneSignal: permission changed:', event);
    });

    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        const isGetting = await AsyncStorage.getItem('isGetting');
        const theme = await AsyncStorage.getItem('theme');
        const language = await AsyncStorage.getItem('language');
        const settings = await getSetting();
        const countries = await fetchCountries();

        if (userJson) {
          // After restoring token, we may need to validate it in production apps

          // This will switch to the App screen or Auth screen and this loading
          // screen will be unmounted and thrown away.
          const {token, user} = JSON.parse(userJson);
          dispatch({type: 'RESTORE_TOKEN', token, user});
          OneSignal.sendTag('user_id', user.ID);
        }
        if (isGetting === 'f') {
          dispatch({type: 'CLOSE_GETTING_START'});
        }
        if (theme) {
          dispatch({type: 'SET_THEME', theme: theme});
        }
        if (language) {
          dispatch({type: 'SET_LANGUAGE', language});
        }
        if (settings?.currency) {
          const dataCurrent = settings?.currencies?.[settings?.currency];
          dispatch({
            type: 'SET_CURRENCY',
            payload: {
              currency: settings.currency,
              positionCurrency: dataCurrent?.position ?? 'left',
            },
          });
        }

        i18n.changeLanguage(language);
        const isRTL = i18n.dir(language) === 'rtl';
        I18nManager.forceRTL(isRTL);
        // Reload
        if (isRTL !== I18nManager.isRTL) {
          RNRestart.Restart();
        }

        dispatch({type: 'GET_COUNTRIES_SUCCESS', countries});
        SplashScreen.hide();
        setLoading(false);
      } catch (e) {
        console.log('e', e);
        // Restoring token failed
      }
    };

    bootstrapAsync();
  }, [i18n, state.language]);
  React.useEffect(() => {
    return () => {
      // ,
    };
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async ({username, password}) => {
        dispatch({type: 'SIGN_IN'});
        try {
          const {token, user} = await loginWithEmail(
            JSON.stringify({username, password}),
          );
          const roles = user?.roles ?? [];
          if (includes(roles, 'wcfm_vendor')) {
            await AsyncStorage.setItem('user', JSON.stringify({token, user}));
            dispatch({type: 'SIGN_IN_SUCCESS', token, user});
            OneSignal.sendTag('user_id', user.ID);
            showMessage({
              message: 'Login',
              description: 'Login Success',
              type: 'success',
            });
          } else {
            showMessage({
              message: 'Login',
              description: 'Role account must a store vendor',
              type: 'danger',
            });
            dispatch({type: 'SIGN_IN_ERROR', error: {}});
          }
        } catch (error) {
          showMessage({
            message: 'Login',
            description: error.message.replace(regex, ''),
            type: 'danger',
          });
          dispatch({type: 'SIGN_IN_ERROR', error});
        }
      },
      signInSuccess: async ({token, user}) => {
        await AsyncStorage.setItem('user', JSON.stringify({token, user}));
        dispatch({type: 'SIGN_IN_SUCCESS', token, user});
        OneSignal.sendTag('user_id', user.ID);
        showMessage({
          message: 'Login',
          description: 'Login Success',
          type: 'success',
        });
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('user');
          dispatch({type: 'SIGN_OUT'});
        } catch (e) {
          console.log(e);
        }
      },
      signUp: async (data, cb) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        const token = 'dummy-auth-token';
        await AsyncStorage.setItem('user', token);
        dispatch({type: 'SIGN_IN', token: token});
        cb();
      },
      setTheme: async value => {
        await AsyncStorage.setItem('theme', value);
        dispatch({type: 'SET_THEME', theme: value});
      },
      setLanguage: async data => {
        await AsyncStorage.setItem('language', data);
        dispatch({type: 'SET_LANGUAGE', language: data});
      },
      closeGettingStart: async () => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        await AsyncStorage.setItem('isGetting', 'f');
        dispatch({type: 'CLOSE_GETTING_START'});
      },
      getCountries: async () => {
        dispatch({type: 'GET_COUNTRIES'});
        try {
          const countries = await fetchCountries();
          dispatch({type: 'GET_COUNTRIES_SUCCESS', countries});
        } catch (e) {
          dispatch({type: 'GET_COUNTRIES_ERROR'});
        }
      },
    }),
    [],
  );

  const barStyle = state.theme === 'light' ? 'dark-content' : 'light-content';
  const themeData = state.theme === 'dark' ? themeDark : themeLight;

  if (loading) {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer theme={themeData}>
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={barStyle}
        />
        <AuthContext.Provider value={{...authContext, ...state}}>
          <Stack.Navigator>
            {state.isGetting ? (
              <Stack.Screen
                options={options}
                name="GettingStartScreen"
                component={GettingStartScreen}
              />
            ) : !state.userToken ? (
              <Stack.Screen
                options={{
                  ...options,
                  animationEnabled: false,
                }}
                name="AuthStack"
                component={
                  PLUGIN_VENDOR_INSTALLED === DOKAN ? AuthStackDokan : AuthStack
                }
              />
            ) : (
              <>
                <Stack.Screen
                  options={{
                    ...options,
                    animationEnabled: false,
                  }}
                  name="MainTab"
                  component={MainTab}
                />
                <Stack.Screen
                  options={options}
                  name="FormProductScreen"
                  component={FormProductScreen}
                />
                <Stack.Screen
                  options={options}
                  name="OrderDetailScreen"
                  component={OrderDetailScreen}
                />
                <Stack.Screen
                  options={options}
                  name="SettingStoreScreen"
                  component={SettingStoreScreen}
                />
                <Stack.Screen
                  options={options}
                  name="UpdateStoreScreen"
                  component={UpdateStoreScreen}
                />
                <Stack.Screen
                  options={options}
                  name="UpdatePersonScreen"
                  component={UpdatePersonScreen}
                />
                <Stack.Screen
                  options={options}
                  name="UpdateAddressScreen"
                  component={UpdateAddressScreen}
                />
                <Stack.Screen
                  options={options}
                  name="UpdateSocialScreen"
                  component={UpdateSocialScreen}
                />
                <Stack.Screen
                  options={options}
                  name="UpdatePaymentScreen"
                  component={UpdatePaymentScreen}
                />
                <Stack.Screen
                  options={options}
                  name="ChatVendorDetailScreen"
                  component={ChatVendorDetailScreen}
                />
                <Stack.Screen
                  options={options}
                  name="ReportScreen"
                  component={ReportScreen}
                />
              </>
            )}
          </Stack.Navigator>
        </AuthContext.Provider>
      </SafeAreaProvider>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default App;
