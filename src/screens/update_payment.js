import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Text from 'src/components/Text';
import Icon from 'src/components/Icon';
import Button from 'src/components/Button';
import Header from 'src/components/Header';
import Select from 'src/containers/Select';
import PaymentPaypal from './auth/PaymentPaypal';
import PaymentBank from './auth/PaymentBank';

import services from 'src/services';
import {AuthContext} from 'src/utils/auth-context';

import {showMessage} from 'src/utils/message';

const initPayment = {
  method: 'paypal',
  paypal: {
    email: '',
  },
  skrill: {
    email: '',
  },
  bank: {
    ac_name: '',
    ac_number: '',
    bank_name: '',
    bank_addr: '',
    routing_number: '',
    iban: '',
    swift: '',
    ifsc: '',
  },
};

const Components = {
  paypal: PaymentPaypal,
  bank_transfer: PaymentBank,
};

function UpdatePaymentScreen(props) {
  const {colors} = useTheme();
  const {t} = useTranslation();
  const {user, userToken} = React.useContext(AuthContext);
  const {navigation} = props;

  const methods = [
    {
      value: 'paypal',
      nameData: 'paypal',
      name: t('common:text_paypal'),
      title: t('common:text_paypal'),
    },
    {
      value: 'bank_transfer',
      nameData: 'bank',
      name: t('common:text_bank_transfer'),
      title: t('common:text_bank'),
    },
  ];

  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [data, setData] = React.useState({});
  const [payment, setPayment] = React.useState(initPayment);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const dataResult = await services.getStore(user.ID, userToken);
        setData(dataResult);
        setPayment(dataResult.payment);
        setLoadingData(false);
      } catch (e) {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [user, userToken]);
  const selectMethod =
    methods.find(value => value.value === payment.method) || methods[0];
  const Form = Components?.[selectMethod?.value] ?? null;
  const onChangeInfo = (key, value) => {
    setPayment({
      ...payment,
      [selectMethod.nameData]: {
        ...payment[selectMethod.nameData],
        [key]: value,
      },
    });
  };

  const clickSave = async () => {
    try {
      setLoadingSave(true);
      const dataUser = {
        key: 'wcfmmp_profile_settings',
        data: {
          ...data,
          payment: payment,
        },
      };
      const dataSave = await services.updateStore(dataUser, userToken);

      if (dataSave) {
        showMessage({
          message: 'Update payment',
          description: 'Update payment success',
          type: 'success',
        });
      } else {
        showMessage({
          message: 'Update payment',
          description: 'Update payment fail',
          type: 'danger',
        });
      }
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
              {t('account:text_update_payment')}
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
            {t('account:text_update_payment')}
          </Text>
        }
      />
      <KeyboardAvoidingView style={styles.keyboard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.viewMethod}>
              <Text secondary>{t('account:text_payment_method')}</Text>
              <Select
                type="underline"
                options={methods}
                valueSelect={payment.method}
                onSelect={value =>
                  setPayment({
                    ...payment,
                    method: value,
                  })
                }
                contentStyle={[
                  styles.selectContent,
                  {backgroundColor: colors.secondaryCard},
                ]}
                containerStyle={styles.selectContainer}
                touchStyle={styles.touchContent}
                style={styles.selectMethod}
              />
            </View>
            {selectMethod ? (
              <>
                <Text h2 medium h2Style={styles.textDetail}>
                  {t('account:text_detail_method', {name: selectMethod.title})}
                </Text>
                {Form ? (
                  <Form
                    data={payment[selectMethod.nameData]}
                    onChangeInfo={onChangeInfo}
                  />
                ) : null}
              </>
            ) : null}
            <Button
              title={t('common:text_button_save')}
              containerStyle={styles.button}
              loading={loadingSave}
              onPress={clickSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
  },
  viewMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectMethod: {
    minHeight: 30,
    paddingVertical: 0,
  },
  selectContent: {
    marginBottom: 0,
    borderBottomWidth: 0,
    borderRadius: 8,
  },
  selectContainer: {
    width: 156,
    marginBottom: 0,
  },
  touchContent: {
    paddingLeft: 14,
    paddingRight: 7,
  },
  textDetail: {
    marginTop: 30,
    marginBottom: 15,
  },
  button: {
    marginTop: 15,
    marginBottom: 25,
  },
});

export default UpdatePaymentScreen;
