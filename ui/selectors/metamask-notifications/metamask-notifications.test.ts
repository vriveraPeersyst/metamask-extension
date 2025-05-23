import { NotificationServicesController } from '@metamask/notification-services-controller';
import {
  selectIsMetamaskNotificationsEnabled,
  getMetamaskNotifications,
  getMetamaskNotificationsReadList,
  getMetamaskNotificationsUnreadCount,
  selectIsFeatureAnnouncementsEnabled,
  getValidNotificationAccounts,
} from './metamask-notifications';

type Notification = NotificationServicesController.Types.INotification;

const mockNotifications: Notification[] = [
  NotificationServicesController.Processors.processNotification(
    NotificationServicesController.Mocks.createMockNotificationEthReceived(),
  ),
];

describe('Metamask Notifications Selectors', () => {
  const mockState = {
    metamask: {
      subscriptionAccountsSeen: [] as string[],
      isMetamaskNotificationsFeatureSeen: true,
      isNotificationServicesEnabled: true,
      isFeatureAnnouncementsEnabled: true,
      metamaskNotificationsList: mockNotifications,
      metamaskNotificationsReadList: [],
      isBackupAndSyncUpdateLoading: false,
      isFetchingMetamaskNotifications: false,
      isUpdatingMetamaskNotifications: false,
      isUpdatingMetamaskNotificationsAccount: [],
      isCheckingAccountsPresence: false,
    },
  };

  it('should select the isMetamaskNotificationsFeatureSeen state', () => {
    expect(selectIsMetamaskNotificationsEnabled(mockState)).toBe(true);
  });

  it('should select the isMetamaskNotificationsEnabled state', () => {
    expect(selectIsMetamaskNotificationsEnabled(mockState)).toBe(true);
  });

  it('should select the metamaskNotificationsList from state', () => {
    expect(getMetamaskNotifications(mockState)).toEqual(mockNotifications);
  });

  it('should select the metamaskNotificationsReadList from state', () => {
    expect(getMetamaskNotificationsReadList(mockState)).toEqual([]);
  });

  it('should select the count of unread MetaMask notifications from state', () => {
    const expectedUnreadNotificationsCount = mockNotifications.filter(
      (notification) => !notification.isRead,
    ).length;
    expect(getMetamaskNotificationsUnreadCount(mockState)).toEqual(
      expectedUnreadNotificationsCount,
    );
  });

  it('should select the isFeatureAnnouncementsEnabled state', () => {
    expect(selectIsFeatureAnnouncementsEnabled(mockState)).toBe(true);
  });

  it('should select the valid accounts that can enable notifications', () => {
    const state = { ...mockState };
    state.metamask.subscriptionAccountsSeen = ['0x1111'];
    expect(getValidNotificationAccounts(state)).toStrictEqual(['0x1111']);
  });
});
