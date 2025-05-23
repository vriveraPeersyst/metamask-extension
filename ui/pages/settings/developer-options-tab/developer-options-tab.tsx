import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  Box,
  Button,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../components/component-library';
import {
  IconColor,
  TextColor,
  Display,
  FlexDirection,
  JustifyContent,
  AlignItems,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_SECURE_YOUR_WALLET_ROUTE } from '../../../helpers/constants/routes';
import {
  getNumberOfSettingRoutesInTab,
  handleSettingsRefs,
} from '../../../helpers/utils/settings-search';

import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  resetOnboarding,
  resetViewedNotifications,
  setServiceWorkerKeepAlivePreference,
} from '../../../store/actions';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../shared/constants/app';
import { getRemoteFeatureFlags } from '../../../selectors';
import ToggleRow from './developer-options-toggle-row-component';
import SentryTest from './sentry-test';
import { BackupAndSyncDevSettings } from './backup-and-sync';

/**
 * Settings Page for Developer Options (internal-only)
 *
 * This page does not need i18n translation support because it's an internal settings page.
 * We only support the t('developerOptions') translation because the general settings architecture
 * utilizes the translation key to render.
 *
 * @returns
 */
const DeveloperOptionsTab = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const [hasResetAnnouncements, setHasResetAnnouncements] = useState(false);
  const [hasResetOnboarding, setHasResetOnboarding] = useState(false);
  const [isServiceWorkerKeptAlive, setIsServiceWorkerKeptAlive] =
    useState(true);

  const settingsRefs = Array(
    getNumberOfSettingRoutesInTab(t, t('developerOptions')),
  )
    .fill(undefined)
    .map(() => {
      return React.createRef();
    });

  useEffect(() => {
    handleSettingsRefs(t, t('developerOptions'), settingsRefs);
  }, [t, settingsRefs]);

  const handleResetAnnouncementClick = useCallback((): void => {
    resetViewedNotifications();
    setHasResetAnnouncements(true);
  }, []);

  const handleResetOnboardingClick = useCallback(async (): Promise<void> => {
    await dispatch(resetOnboarding());
    setHasResetOnboarding(true);

    const backUpSRPRoute = `${ONBOARDING_SECURE_YOUR_WALLET_ROUTE}/?isFromReminder=true`;
    const isPopup = getEnvironmentType() === ENVIRONMENT_TYPE_POPUP;

    if (isPopup) {
      const { platform } = global;
      if (platform?.openExtensionInBrowser) {
        platform?.openExtensionInBrowser(backUpSRPRoute, null, true);
      }
    } else {
      history.push(backUpSRPRoute);
    }
  }, [dispatch, history]);

  const handleToggleServiceWorkerAlive = async (
    value: boolean,
  ): Promise<void> => {
    await dispatch(setServiceWorkerKeepAlivePreference(value));
    setIsServiceWorkerKeptAlive(value);
  };

  const renderAnnouncementReset = () => {
    return (
      <Box
        ref={settingsRefs[1] as React.RefObject<HTMLDivElement>}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>Announcements</span>
          <div className="settings-page__content-description">
            Resets isShown boolean to false for all announcements. Announcements
            are the notifications shown in the What&apos;s New popup modal.
          </div>
        </div>

        <div className="settings-page__content-item-col">
          <Button
            variant={ButtonVariant.Primary}
            onClick={handleResetAnnouncementClick}
          >
            Reset
          </Button>
        </div>
        <div className="settings-page__content-item-col">
          <Box
            display={Display.Flex}
            alignItems={AlignItems.center}
            paddingLeft={2}
            paddingRight={2}
            style={{ height: '40px', width: '40px' }}
          >
            <Icon
              className="settings-page-developer-options__icon-check"
              name={IconName.Check}
              color={IconColor.successDefault}
              size={IconSize.Lg}
              hidden={!hasResetAnnouncements}
            />
          </Box>
        </div>
      </Box>
    );
  };

  const renderOnboardingReset = () => {
    return (
      <Box
        ref={settingsRefs[2] as React.RefObject<HTMLDivElement>}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div
          className="settings-page__content-item"
          style={{ flex: '1 1 auto' }}
        >
          <span>Onboarding</span>
          <div className="settings-page__content-description">
            Resets various states related to onboarding and redirects to the
            "Secure Your Wallet" onboarding page.
          </div>
        </div>

        <div className="settings-page__content-item-col">
          <Button
            variant={ButtonVariant.Primary}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31879
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={handleResetOnboardingClick}
          >
            Reset
          </Button>
        </div>
        <div className="settings-page__content-item-col">
          <Box
            display={Display.Flex}
            alignItems={AlignItems.center}
            paddingLeft={2}
            paddingRight={2}
            style={{ height: '40px', width: '40px' }}
          >
            <Icon
              className="settings-page-developer-options__icon-check"
              name={IconName.Check}
              color={IconColor.successDefault}
              size={IconSize.Lg}
              hidden={!hasResetOnboarding}
            />
          </Box>
        </div>
      </Box>
    );
  };

  const renderServiceWorkerKeepAliveToggle = () => {
    return (
      <ToggleRow
        title="Service Worker Keep Alive"
        description="Results in a timestamp being continuously saved to session.storage"
        isEnabled={isServiceWorkerKeptAlive}
        // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31879
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onToggle={(value) => handleToggleServiceWorkerAlive(!value)}
        dataTestId="developer-options-service-worker-alive-toggle"
        settingsRef={settingsRefs[3] as React.RefObject<HTMLDivElement>}
      />
    );
  };

  const remoteFeatureFlags = useSelector(getRemoteFeatureFlags);

  const renderRemoteFeatureFlags = () => {
    return (
      <Box
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>Remote feature flags</span>
          <div className="settings-page__content-description">
            Remote feature flag values come from LaunchDarkly by default. If you
            need to update feature flag values locally for development purposes,
            you can change feature flag values in .manifest-overrides.json,
            which will override values coming from LaunchDarkly.
          </div>
        </div>
        <div
          className="settings-page__content-description"
          data-testid="developer-options-remote-feature-flags"
        >
          {JSON.stringify(remoteFeatureFlags)}
        </div>
      </Box>
    );
  };

  return (
    <div className="settings-page__body">
      <Text className="settings-page__security-tab-sub-header__bold">
        States
      </Text>

      <Text
        className="settings-page__security-tab-sub-header"
        color={TextColor.textAlternative}
        paddingTop={6}
        ref={settingsRefs[0] as React.RefObject<HTMLDivElement>}
      >
        Current States
      </Text>
      <div className="settings-page__content-padded">
        {renderRemoteFeatureFlags()}
      </div>
      <Text
        className="settings-page__security-tab-sub-header"
        color={TextColor.textAlternative}
        paddingTop={6}
        ref={settingsRefs[0] as React.RefObject<HTMLDivElement>}
      >
        Reset States
      </Text>
      <div className="settings-page__content-padded">
        {renderAnnouncementReset()}
        {renderOnboardingReset()}
        {renderServiceWorkerKeepAliveToggle()}
      </div>

      <BackupAndSyncDevSettings />
      <SentryTest />
    </div>
  );
};

export default DeveloperOptionsTab;
