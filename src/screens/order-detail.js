import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@react-navigation/native';
import {StyleSheet, ScrollView, View, TouchableOpacity} from 'react-native';
import Text from 'src/components/Text';
import Icon from 'src/components/Icon';
import Button from 'src/components/Button';
import Badge from 'src/components/Badge';
import Header from 'src/components/Header';
import Card from 'src/components/Card';
import IconRadio from 'src/containers/IconRadio';

import {listStatus} from './order/configs';

import {getCustomer} from 'src/services/auth-service';
import {getDate, getTime} from 'src/utils/time';
import {AuthContext} from 'src/utils/auth-context';
import {showMessage} from 'src/utils/message';
import currencyFormatter from 'src/utils/currency_formatter';

import {gray3} from 'src/configs/colors';
import services from 'src/services/index';

function OrderDetailScreen(props) {
  const {colors} = useTheme();
  const {t} = useTranslation();
  const {navigation, route} = props;
  const {userToken} = React.useContext(AuthContext);
  const data = route?.params?.data ?? null;
  const [currentStatus, setCurrentStatus] = React.useState(
    data?.status ?? 'on-hold',
  );
  const [loading, setLoading] = React.useState(false);
  const [nameCustomer, setNameCustomer] = React.useState('');

  React.useEffect(() => {
    async function fetchData() {
      try {
        if (data?.customer_id) {
          const customer = await getCustomer(data.customer_id);
          const name = `${customer.first_name} ${customer.last_name}`;
          setNameCustomer(name);
        }
      } catch (e) {}
    }
    fetchData();
  }, [data]);

  if (!data) {
    return (
      <View style={[styles.container, styles.viewEmpty]}>
        <Text>Empty</Text>
      </View>
    );
  }
  const {
    id,
    number,
    status,
    date_created,
    shipping,
    billing,
    line_items,
    shipping_lines,
    payment_method_title,
    vendor_order_details,
    currency,
  } = data;

  const getStatus =
    listStatus.find(dataStatus => dataStatus.value === status) ?? listStatus[0];

  const clickSave = () => {
    if (currentStatus !== status) {
      setLoading(true);
      handleSave();
    } else {
      showMessage({
        message: 'Update',
        description: 'Select different status',
        type: 'warning',
      });
    }
  };

  const handleSave = async () => {
    try {
      await services.updateOrders(id, {status: currentStatus}, userToken);
      setLoading(false);
      if (route?.params?.goBack) {
        route.params.goBack();
      }
      showMessage({
        message: 'Update',
        description: 'Update status order success',
        type: 'success',
      });
      navigation.goBack();
    } catch (e) {
      setLoading(false);
      showMessage({
        message: 'Update',
        description: e.message,
        type: 'danger',
      });
    }
  };

  const getAddress = dataAddress => {
    var result = '';
    var symbol = '';
    if (dataAddress?.address_2) {
      result = result + dataAddress?.address_2;
      symbol = ', ';
    }
    if (dataAddress?.address_1) {
      result = result + symbol + dataAddress?.address_1;
      symbol = ', ';
    }
    if (dataAddress?.city) {
      result = result + symbol + dataAddress?.city;
      symbol = ', ';
    }
    if (dataAddress?.state) {
      result = result + symbol + dataAddress?.state;
      symbol = ', ';
    }
    if (dataAddress?.country) {
      result = result + symbol + dataAddress?.country;
    }
    return result;
  };

  const getShipping = () => {
    let result = '';
    for (const dataShipping of shipping_lines) {
      const index = shipping_lines.indexOf(dataShipping);
      if (index !== 0) {
        result = result + '\n';
      }
      result = result + dataShipping.method_title;
    }
    return result;
  };

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
            {t('order:text_order', {number})}
          </Text>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.viewNumber}>
            <Icon name="receipt" color={colors.primary} />
            <Text h3 bold h3Style={styles.textNumber}>
              #{number}
            </Text>
            <Badge
              value={t(getStatus.name)}
              type={getStatus.type}
              containerStyle={styles.badge}
            />
          </View>
          <View style={styles.viewTime}>
            <Text h6 third>
              {getDate(date_created)}
            </Text>
            <Text h6 third h6Style={styles.textTime}>
              {getTime(date_created)}
            </Text>
            {nameCustomer ? (
              <Text h6 third>
                {t('order:text_by', {name: nameCustomer})}
              </Text>
            ) : null}
          </View>
          <Text h4 medium h4Style={styles.title}>
            {t('order:text_billing_address')}
          </Text>
          <Card secondary style={[styles.card, styles.cardBilling]}>
            <Text h4 medium h4Style={styles.userAddress}>
              {billing?.first_name} {billing.last_name}
            </Text>
            {billing.company ? <Text secondary>{billing.company}</Text> : null}
            <Text secondary>{getAddress(billing)}</Text>
            <Text secondary>{billing?.postcode}</Text>
            <Text secondary>
              {t('order:text_email', {email: billing?.email})}
            </Text>
            <Text secondary>
              {t('order:text_phone', {phone: billing?.phone})}
            </Text>
          </Card>
          <Text h4 medium h4Style={styles.title}>
            {t('order:text_shipping_address')}
          </Text>
          <Card secondary style={[styles.card, styles.cardShipping]}>
            <Text h4 medium h4Style={styles.userAddress}>
              {shipping?.first_name} {shipping.last_name}
            </Text>
            {shipping.company ? (
              <Text secondary>{shipping.company}</Text>
            ) : null}
            <Text secondary>{getAddress(shipping)}</Text>
            <Text secondary>{shipping?.postcode}</Text>
          </Card>
          <Text h4 medium h4Style={styles.title}>
            {t('order:text_information_product')}
          </Text>
          <View
            style={[styles.cardBorder, {borderColor: colors.secondaryCard}]}>
            <Card secondary style={[styles.card, styles.viewProduct]}>
              {line_items.map((product, index) => (
                <View key={product.id}>
                  <View style={styles.itemProduct}>
                    <View style={styles.itemProductLeft}>
                      <Text style={{color: colors.primary}}>
                        {product.name}
                      </Text>
                      <Text h6 secondary>
                        {product?.meta_data && product.meta_data.length > 0
                          ? product.meta_data
                              .map(meta => {
                                return `${meta.key}: ${meta.value}, `;
                              })
                              .join('')
                          : ''}
                        {product?.sku ? `SKU: ${product.sku}` : null}
                      </Text>
                    </View>
                    <Text>
                      {currencyFormatter(product.price, currency)} x
                      {product.quantity}
                    </Text>
                  </View>
                  {index < line_items.length - 1 ? (
                    <View style={styles.viewLine}>
                      <View style={styles.line} />
                    </View>
                  ) : null}
                </View>
              ))}
            </Card>
            <View style={styles.viewTotal}>
              <View style={[styles.itemTotal, styles.viewPayment]}>
                <Text h6 secondary>
                  {t('order:text_shipping_items')}
                </Text>
                <Text h6 h6Style={styles.textRightTotal}>
                  {getShipping()}
                </Text>
              </View>
              <View style={[styles.itemTotal, styles.viewPayment]}>
                <Text h6 secondary>
                  {t('order:text_payment_method')}
                </Text>
                <Text h6 h6Style={styles.textRightTotal}>
                  {payment_method_title}
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <Text secondary>{t('order:text_subtotal')}</Text>
                <Text style={styles.textRightTotal}>
                  {currencyFormatter(
                    vendor_order_details.item_sub_total,
                    currency,
                  )}
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <Text secondary>{t('order:text_tax')}</Text>
                <Text style={styles.textRightTotal}>
                  {currencyFormatter(vendor_order_details.tax, currency)}
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <Text secondary>{t('order:text_shipping')}</Text>
                <Text style={styles.textRightTotal}>
                  {currencyFormatter(vendor_order_details.shipping, currency)}
                </Text>
              </View>
              <View style={[styles.itemTotal, styles.viewPriceTotal]}>
                <Text h4 medium>
                  {t('order:text_total')}
                </Text>
                <Text h4 medium h4Style={styles.textRightTotal}>
                  {currencyFormatter(
                    vendor_order_details.total_commission,
                    currency,
                  )}
                </Text>
              </View>
            </View>
          </View>
          <Text h4 medium h4Style={styles.title}>
            {t('order:text_change_status')}
          </Text>
          <View
            style={[
              styles.cardBorder,
              styles.viewChangeStatus,
              {borderColor: colors.secondaryCard},
            ]}>
            {listStatus.map(dataStatus => (
              <TouchableOpacity
                key={dataStatus.value}
                disabled={dataStatus.value === currentStatus}
                style={styles.viewRadio}
                onPress={() => setCurrentStatus(dataStatus.value)}
                activeOpacity={0.75}>
                <IconRadio isSelected={dataStatus.value === currentStatus} />
                <Text
                  secondary={dataStatus.value !== currentStatus}
                  style={[
                    styles.textRadioStatus,
                    dataStatus.value === currentStatus && {
                      color: colors.primary,
                    },
                  ]}>
                  {t(dataStatus.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.viewButton}>
            <Button
              title={t('order:text_button_save')}
              buttonStyle={styles.button}
              loading={loading}
              onPress={clickSave}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 25,
  },
  viewNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textNumber: {
    flex: 1,
    marginHorizontal: 20,
  },
  badge: {
    paddingHorizontal: 12,
  },
  viewTime: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  textTime: {
    marginHorizontal: 10,
  },
  title: {
    marginBottom: 19,
  },
  card: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  cardBorder: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 30,
  },
  cardBilling: {
    paddingBottom: 12,
  },
  cardShipping: {
    paddingBottom: 16,
  },
  userAddress: {
    marginBottom: 10,
  },
  viewProduct: {
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 0,
  },
  itemProduct: {
    marginTop: 10,
    marginBottom: 15,
    flexDirection: 'row',
  },
  itemProductLeft: {
    flex: 1,
    marginRight: 12,
  },
  viewLine: {
    height: 1,
    overflow: 'hidden',
  },
  line: {
    borderWidth: 1,
    borderRadius: 1,
    borderColor: gray3,
    borderStyle: 'dashed',
  },
  viewTotal: {
    paddingHorizontal: 20,
    paddingTop: 19,
    paddingBottom: 23,
  },
  itemTotal: {
    flexDirection: 'row',
  },
  textRightTotal: {
    flex: 1,
    textAlign: 'right',
  },
  viewPayment: {
    marginBottom: 3,
  },
  viewPriceTotal: {
    marginTop: 8,
  },
  viewChangeStatus: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  viewRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  textRadioStatus: {
    flex: 1,
    marginLeft: 10,
  },
  viewButton: {
    alignItems: 'center',
    marginVertical: 33,
  },
  button: {
    width: 161,
  },
});

export default OrderDetailScreen;
