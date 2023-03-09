import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Header from 'src/components/Header';
import Text from 'src/components/Text';
import Input from 'src/components/Input';
import Icon from 'src/components/Icon';
import Button from 'src/components/Button';
import InputCountry from './account/InputCountry';

import {AuthContext} from 'src/utils/auth-context';
import {showMessage} from 'src/utils/message';
import services from 'src/services';
import {
  INITIAL_COUNTRY_ADDRESS,
  INITIAL_STATE_ADDRESS,
} from 'src/configs/config-input-phone-number';

const initBilling = {
  address_1: '',
  address_2: '',
  city: '',
  company: '',
  country: INITIAL_COUNTRY_ADDRESS,
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  postcode: '',
  state: INITIAL_STATE_ADDRESS,
};

const initShipping = {
  address_1: '',
  address_2: '',
  city: '',
  company: '',
  country: INITIAL_COUNTRY_ADDRESS,
  first_name: '',
  last_name: '',
  postcode: '',
  state: INITIAL_STATE_ADDRESS,
};

function UpdateAddressScreen(props) {
  const {t} = useTranslation();
  const {user, userToken} = React.useContext(AuthContext);

  const {navigation} = props;

  const [billing, setBilling] = React.useState(initBilling);
  const [shipping, setShipping] = React.useState(initShipping);

  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [typeBilling, setTypeBilling] = React.useState(true);
  const [typeShipping, setTypeShipping] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const dataResult = await services.getProfile({}, userToken);
        setBilling(dataResult.billing);
        setShipping(dataResult.shipping);
        setLoadingData(false);
      } catch (e) {
        console.log('e', e);
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user, userToken]);

  const clickSave = async () => {
    try {
      setLoadingSave(true);
      await services.updateProfile(
        user.ID,
        {
          shipping,
          billing,
        },
        userToken,
      );
      showMessage({
        message: 'Update payment',
        description: 'Update payment success',
        type: 'success',
      });
      setLoadingSave(false);
    } catch (e) {
      showMessage({
        message: 'Update payment',
        description: e.message,
        type: 'danger',
      });
      setLoadingSave(false);
    }
  };

  const changeBilling = value =>
    setBilling({
      ...billing,
      ...value,
    });
  const changeShipping = value =>
    setShipping({
      ...shipping,
      ...value,
    });

  if (loadingData) {
    return (
      <View style={styles.container}>
        <Header
          leftComponent={
            <Icon
              name="arrow-left"
              onPress={() => navigation.goBack()}
              isRotateRTL
            />
          }
          centerComponent={
            <Text h4 medium>
              {t('account:text_address')}
            </Text>
          }
        />
        <ActivityIndicator size="small" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Header
        leftComponent={
          <Icon
            name="arrow-left"
            onPress={() => navigation.goBack()}
            isRotateRTL
          />
        }
        centerComponent={
          <Text h4 medium>
            {t('account:text_address')}
          </Text>
        }
      />
      <KeyboardAvoidingView behavior="height" style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.viewTitle}
              onPress={() => setTypeBilling(!typeBilling)}>
              <Text h4 medium>
                Billing Address
              </Text>
              <Icon
                name={typeBilling ? 'chevron-down' : 'chevron-right'}
                size={22}
                isRotateRTL={!typeBilling}
              />
            </TouchableOpacity>
            {typeBilling ? (
              <View style={styles.form}>
                <View style={styles.rowInput}>
                  <View style={styles.colInput}>
                    <Input
                      label={t('inputs:text_first_name')}
                      value={billing.first_name}
                      onChangeText={value => changeBilling({first_name: value})}
                    />
                  </View>
                  <View style={styles.colInput}>
                    <Input
                      label={t('inputs:text_last_name')}
                      value={billing.last_name}
                      onChangeText={value => changeBilling({last_name: value})}
                    />
                  </View>
                </View>
                <Input
                  label={t('inputs:text_address_1')}
                  value={billing.address_1}
                  onChangeText={value => changeBilling({address_1: value})}
                />
                <Input
                  label={t('inputs:text_address_2')}
                  value={billing.address_2}
                  onChangeText={value => changeBilling({address_2: value})}
                />
                <InputCountry
                  value={billing.country}
                  valueState={billing.state}
                  label={t('inputs:text_country')}
                  labelState={t('inputs:text_state_country')}
                  onChangeCountry={value => changeBilling(value)}
                />
                <Input
                  label={t('inputs:text_city_town')}
                  value={billing.city}
                  onChangeText={value => changeBilling({city: value})}
                />
                <Input
                  label={t('inputs:text_postcode_zip')}
                  value={billing.postcode}
                  onChangeText={value => changeBilling({postcode: value})}
                />
                <Input
                  label={t('inputs:text_email')}
                  value={billing.email}
                  onChangeText={value => changeBilling({email: value})}
                />
                <Input
                  label={t('inputs:text_phone')}
                  value={billing.phone}
                  onChangeText={value => changeBilling({phone: value})}
                />
              </View>
            ) : null}
            <View style={styles.viewManagerStore}>
              <Text secondary>Manager Stock</Text>
              <Switch />
            </View>
            <TouchableOpacity
              style={[styles.viewTitle, styles.shipping]}
              onPress={() => setTypeShipping(!typeShipping)}>
              <Text h4 medium>
                Shipping Address
              </Text>
              <Icon
                name={typeShipping ? 'chevron-down' : 'chevron-right'}
                size={22}
                isRotateRTL={!typeShipping}
              />
            </TouchableOpacity>
            {typeShipping ? (
              <View style={styles.form}>
                <View style={styles.rowInput}>
                  <View style={styles.colInput}>
                    <Input
                      label={t('inputs:text_first_name')}
                      value={shipping.first_name}
                      onChangeText={value =>
                        changeShipping({first_name: value})
                      }
                    />
                  </View>
                  <View style={styles.colInput}>
                    <Input
                      label={t('inputs:text_last_name')}
                      value={shipping.last_name}
                      onChangeText={value => changeShipping({last_name: value})}
                    />
                  </View>
                </View>
                <Input
                  label={t('inputs:text_address_1')}
                  value={shipping.address_1}
                  onChangeText={value => changeShipping({address_1: value})}
                />
                <Input
                  label={t('inputs:text_address_2')}
                  value={shipping.address_2}
                  onChangeText={value => changeShipping({address_2: value})}
                />
                <InputCountry
                  value={shipping.country}
                  valueState={shipping.state}
                  label={t('inputs:text_country')}
                  labelState={t('inputs:text_state_country')}
                  onChangeCountry={value => changeShipping(value)}
                />
                <Input
                  label={t('inputs:text_city_town')}
                  value={shipping.city}
                  onChangeText={value => changeShipping({city: value})}
                />
                <Input
                  label={t('inputs:text_postcode_zip')}
                  value={shipping.postcode}
                  onChangeText={value => changeShipping({postcode: value})}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
        <View style={[styles.content, styles.footer]}>
          <Button
            title={t('common:text_button_save')}
            loading={loadingSave}
            onPress={clickSave}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
  },
  viewTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 17,
  },
  shipping: {
    paddingTop: 17,
  },
  form: {
    marginTop: 13,
  },
  rowInput: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  colInput: {
    flex: 1,
    marginHorizontal: 6,
  },
  viewManagerStore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 25,
  },
});

export default UpdateAddressScreen;
