import * as React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Image from 'src/components/Image';
import ViewLabel from 'src/components/ViewLabel';
import Button from 'src/components/Button';
import Card from 'src/components/Card';
import ModalImage from './ModalImage';
import {updateImages} from '../services/media_service';
import {AuthContext} from 'src/utils/auth-context';
import {showMessage} from 'src/utils/message';

const options = {
  customButtons: [{name: 'media_library', title: 'Choose from media library'}],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera permission',
        },
      );
      // If CAMERA Permission is granted
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

const requestExternalWritePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'External Storage Write Permission',
          message: 'App needs write permission',
        },
      );
      // If WRITE_EXTERNAL_STORAGE Permission is granted
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      alert('Write permission err', err); // eslint-disable-line no-alert
    }
    return false;
  } else {
    return true;
  }
};

function InputImage(props) {
  const [isModal, setModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const {value, onChangeImage, contentStyle, typeGet, ...rest} = props;

  const {userToken} = React.useContext(AuthContext);

  const changeImage = resData => {
    setLoading(true);
    const data = new FormData();
    let mime = resData.type || 'image/jpeg';
    data.append('file', {
      name:
        resData.fileName ||
        `${Math.random().toString(36).substring(7)}.${mime.split('/')[1]}`,
      type: mime,
      uri:
        Platform.OS === 'android'
          ? resData.uri
          : resData.uri.replace('file://', ''),
    });
    updateImages(data, userToken)
      .then(dataApi => {
        setLoading(false);
        onChangeImage(typeGet === 'object' ? dataApi : dataApi.source_url);
        showMessage({
          message: 'Update photo',
          description: 'Update photo complete',
          type: 'success',
        });
      })
      .catch(error => {
        setLoading(false);
        showMessage({
          message: 'Update photo',
          description: error.message,
          type: 'danger',
        });
      });
  };
  const openCamera = async () => {
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
    if (isCameraPermitted && isStoragePermitted) {
      ImagePicker.launchCamera(options, response => {
        if (response.didCancel) {
          alert('User cancelled camera picker'); // eslint-disable-line no-alert
          return;
        } else if (response.errorCode === 'camera_unavailable') {
          alert('Camera not available on device'); // eslint-disable-line no-alert
          return;
        } else if (response.errorCode === 'permission') {
          alert('Permission not satisfied'); // eslint-disable-line no-alert
          return;
        } else if (response.errorCode === 'others') {
          alert(response.errorMessage); // eslint-disable-line no-alert
          return;
        } else {
          if (onChangeImage) {
            const resData = response.assets['0'];
            changeImage(resData);
          }
        }
      });
    }
  };
  const openImageLibrary = () => {
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        setModal(true);
        console.log('User tapped custom button: ', response.customButton);
      } else {
        if (onChangeImage) {
          const resData = response.assets['0'];
          changeImage(resData);
        }
      }
    });
  };
  const getImage = () => {
    Alert.alert(
      'Select Image',
      null,
      [
        {text: 'Cancel', onPress: () => console.log('OK Pressed')},
        {
          text: 'Open Camera',
          onPress: () => {
            openCamera();
          },
        },
        {
          text: 'Open Image Library',
          onPress: () => {
            openImageLibrary();
          },
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <ViewLabel {...rest} type="solid" style={[styles.view, contentStyle]}>
      <View style={styles.content}>
        <Card secondary style={styles.imageCard}>
          {value ? (
            <Image source={{uri: value}} style={styles.image} />
          ) : (
            <View>
              <Image
                source={require('src/assets/images/default_image.png')}
                style={styles.imageEmpty}
              />
            </View>
          )}
        </Card>

        <Button
          title="Select Image"
          size="small"
          secondary
          buttonStyle={styles.button}
          onPress={getImage}
          loading={loading}
        />
      </View>
      <ModalImage
        visible={isModal}
        setModalVisible={v => setModal(v)}
        selectImage={value}
        onChange={v => onChangeImage(v)}
        typeGet={typeGet}
      />
    </ViewLabel>
  );
}

const styles = StyleSheet.create({
  view: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  image: {
    width: 80,
    height: 80,
  },
  imageCard: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageEmpty: {
    width: 40,
    height: 40,
  },
  button: {
    width: 157,
  },
});

export default InputImage;
