import * as React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@react-navigation/native';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ViewLabel from 'src/components/ViewLabel';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import Text from 'src/components/Text';
import Modal from 'src/components/Modal';
import ListItem from 'src/components/ListItem';
import Search from 'src/containers/Search';

import {fonts} from 'src/configs/fonts';

import {AuthContext} from 'src/utils/auth-context';

function InputCountry(props) {
  const {colors} = useTheme();
  const {t} = useTranslation();
  const {countries, expireCountry, loadingCountry, getCountries} =
    React.useContext(AuthContext);

  const {
    label,
    labelState,
    value,
    valueState,
    placeholder,
    placeholderState,
    error,
    errorState,
    onChangeCountry,
  } = props;

  const [search, setSearch] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [visibleState, setVisibleState] = React.useState(false);

  React.useEffect(() => {
    if (!expireCountry || moment.unix(expireCountry).isBefore(moment())) {
      getCountries();
    }
  }, [expireCountry, getCountries]);

  const dataCountry = countries.filter(
    data => data.name.toLowerCase().indexOf(search.toLowerCase()) >= 0,
  );

  const country = countries.find(coun => coun.code === value);
  const states = country?.states ?? [];
  const state = states.find(s => s.code === valueState);

  const changeCountry = data => {
    let valueCountry = {
      country: data.code,
    };
    const dataState = data?.states?.length > 0 ? data.states[0].code : '';

    valueCountry.state = dataState;

    if (onChangeCountry) {
      onChangeCountry(valueCountry);
    }
    setVisible(false);
  };

  const changeState = valueStateCountry => {
    if (onChangeCountry) {
      onChangeCountry({
        state: valueStateCountry,
      });
    }
    setVisibleState(false);
  };

  return (
    <>
      <ViewLabel label={label} error={error}>
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={styles.viewSelect}>
          <View style={styles.leftSelect}>
            {country ? (
              <Text>{country.name}</Text>
            ) : (
              <Text secondary>
                {placeholder || t('account:text_select_country')}
              </Text>
            )}
          </View>
          <Icon name="chevron-down" size={22} color={colors.secondaryText} />
        </TouchableOpacity>
      </ViewLabel>
      {states.length > 0 ? (
        <ViewLabel label={labelState} error={errorState}>
          <TouchableOpacity
            onPress={() => setVisibleState(true)}
            style={styles.viewSelect}>
            <View style={styles.leftSelect}>
              {state ? (
                <Text>{state.name}</Text>
              ) : (
                <Text secondary>
                  {placeholderState || t('account:text_select_state')}
                </Text>
              )}
            </View>
            <Icon name="chevron-down" size={22} color={colors.secondaryText} />
          </TouchableOpacity>
        </ViewLabel>
      ) : (
        <Input
          label={labelState}
          value={valueState}
          onChangeText={changeState}
        />
      )}
      <Modal
        visible={visible}
        setModalVisible={valueVisible => setVisible(valueVisible)}
        minRatio={0.7}>
        <Search
          value={search}
          onChangeText={valueText => setSearch(valueText)}
          showCancel="hidden"
          placeholder={t('account:text_search_country')}
          containerStyle={styles.search}
        />
        <ScrollView>
          <View style={styles.paddingScroll}>
            {loadingCountry ? (
              <ActivityIndicator />
            ) : (
              dataCountry.map(coun => (
                <ListItem
                  key={coun.code}
                  title={coun.name}
                  onPress={() => changeCountry(coun)}
                  bottomDivider
                  rightElement={
                    coun.code === value ? (
                      <Icon name="check" color={colors.primary} />
                    ) : null
                  }
                  titleStyle={
                    coun.code === value
                      ? {
                          color: colors.primary,
                        }
                      : {
                          fontFamily: fonts.regular,
                        }
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </Modal>
      <Modal
        visible={visibleState}
        setModalVisible={valueModal => setVisibleState(valueModal)}
        maxRatio={0.5}>
        <ScrollView>
          <View style={styles.paddingScroll}>
            {loadingCountry ? (
              <ActivityIndicator />
            ) : (
              states.map(s => (
                <ListItem
                  key={s.code}
                  title={s.name}
                  onPress={() => changeState(s.code)}
                  bottomDivider
                  rightElement={
                    s.code === valueState ? (
                      <Icon name="check" color={colors.primary} />
                    ) : null
                  }
                  titleStyle={
                    s.code === valueState
                      ? {
                          color: colors.primary,
                        }
                      : {
                          fontFamily: fonts.regular,
                        }
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  viewSelect: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  search: {
    marginBottom: 16,
    marginHorizontal: 26,
  },
  paddingScroll: {paddingHorizontal: 26},
  leftSelect: {
    flex: 1,
    marginRight: 16,
  },
});

InputCountry.propTypes = {
  label: PropTypes.string,
  labelState: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  valueState: PropTypes.string,
  error: PropTypes.string,
  errorState: PropTypes.string,
  onChangeCountry: PropTypes.func,
};

InputCountry.defaultProps = {
  label: 'Country',
  labelState: 'State/County',
  placeholder: 'Select Country',
  placeholderState: 'Select State',
};

export default InputCountry;
