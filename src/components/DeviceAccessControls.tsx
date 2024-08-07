'use client';

import { Label } from '@ui/label';
import { Switch } from '@ui/switch';
import cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';
import { H4 } from './ui/typography';

const DeviceAccessControls = () => {
  const [isLocationAvailable, setIsLocationAvailable] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  const [locationPermissionState, setLocationPermissionState] =
    useState<PermissionState>('prompt'); // "denied" | "granted" | "prompt"
  const [cameraPermissionState, setCameraPermissionState] =
    useState<PermissionState>('prompt');

  const checkPermissions = useCallback(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setLocationPermissionState(result.state);
          setIsLocationEnabled(result.state === 'granted');
        });

      navigator.permissions
        .query({ name: 'camera' as PermissionName })
        .then((result) => {
          setCameraPermissionState(result.state);
          setIsCameraEnabled(result.state === 'granted');
        });
    }
  }, []);

  useEffect(() => {
    setIsLocationAvailable('geolocation' in navigator);

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setIsCameraAvailable(
          devices.some((device) => device.kind === 'videoinput')
        );
      })
      .catch((err) => {
        console.error('Error checking camera availability:', err);
        setIsCameraAvailable(false);
      });

    checkPermissions();
  }, [checkPermissions]);

  const requestPermission = useCallback((type: 'location' | 'camera') => {
    if (type === 'location') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocationEnabled(true);
          setLocationPermissionState('granted');

          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();

          cookies.set('lat', lat, { maxAge: 7200 });
          cookies.set('lng', lng, { maxAge: 7200 });
        },
        () => {
          setIsLocationEnabled(false);
          setLocationPermissionState('denied');

          cookies.set('lat', '', { maxAge: 0 });
          cookies.set('lng', '', { maxAge: 0 });
        }
      );
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          setIsCameraEnabled(true);
          setCameraPermissionState('granted');
        })
        .catch(() => {
          setIsCameraEnabled(false);
          setCameraPermissionState('denied');
        });
    }
  }, []);

  const togglePermission = useCallback(
    (type: 'location' | 'camera') => {
      const permissionState =
        type === 'location' ? locationPermissionState : cameraPermissionState;
      if (permissionState === 'granted') {
        if (type === 'location') {
          setIsLocationEnabled((prev) => !prev);
        } else {
          setIsCameraEnabled((prev) => !prev);
        }
      } else {
        requestPermission(type);
      }
    },
    [locationPermissionState, cameraPermissionState, requestPermission]
  );

  const getPermissionMessage = (type: 'location' | 'camera') => {
    const state =
      type === 'location' ? locationPermissionState : cameraPermissionState;
    if (state === 'denied') {
      return '權限被拒絕。請在瀏覽器設置中更改權限，或重新整理頁面。';
    }
    if (state === 'granted') {
      return '權限已授予。如需更改，請在瀏覽器設置中修改。';
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <H4>開啟裝置權限</H4>
      <div className="flex items-center space-x-2">
        <Switch
          checked={isLocationEnabled}
          onCheckedChange={() => togglePermission('location')}
          disabled={
            !isLocationAvailable ||
            locationPermissionState === 'denied' ||
            locationPermissionState === 'granted'
          }
          id="location-switch"
        />
        <Label htmlFor="location-switch">
          {isLocationAvailable ? '開啟定位' : '定位不可用'}
        </Label>
        <span className="text-sm text-red-500">
          {getPermissionMessage('location')}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={isCameraEnabled}
          onCheckedChange={() => togglePermission('camera')}
          disabled={
            !isCameraAvailable ||
            cameraPermissionState === 'denied' ||
            cameraPermissionState === 'granted'
          }
          id="camera-switch"
        />
        <Label htmlFor="camera-switch">
          {isCameraAvailable ? '開啟相機' : '相機不可用'}
        </Label>
        <span className="text-sm text-red-500">
          {getPermissionMessage('camera')}
        </span>
      </div>
    </div>
  );
};

export default DeviceAccessControls;
