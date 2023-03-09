import * as React from 'react';
import PropTypes from 'prop-types';
import {useTheme} from '@react-navigation/native';
import {View, ViewPropTypes} from 'react-native';

function Card(props) {
  const {colors} = useTheme();
  const {Component, style, third, secondary, ...rest} = props;
  const bgColor = third
    ? colors.thirdCard
    : secondary
    ? colors.secondaryCard
    : colors.card;
  return <Component {...rest} style={[{backgroundColor: bgColor}, style]} />;
}

Card.propTypes = {
  Component: PropTypes.elementType,
  secondary: PropTypes.bool,
  third: PropTypes.bool,
  style: ViewPropTypes.style,
};

Card.defaultProps = {
  Component: View,
  secondary: false,
  third: false,
  style: {},
};

export default Card;
