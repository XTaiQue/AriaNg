(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgSettingsController', ['$rootScope', '$scope', '$routeParams', '$window', '$interval', '$timeout', 'ariaNgLanguages', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgMonitorService', 'ariaNgNotificationService', 'ariaNgTitleService', function ($rootScope, $scope, $routeParams, $window, $interval, $timeout, ariaNgLanguages, ariaNgCommonService, ariaNgSettingService, ariaNgMonitorService, ariaNgNotificationService, ariaNgTitleService) {
        var extendType = $routeParams.extendType;

        var getFinalTitle = function () {
            return ariaNgTitleService.getFinalTitleByGlobalStat(ariaNgMonitorService.getCurrentGlobalStat());
        };

        $scope.context = {
            currentTab: 'global',
            languages: ariaNgLanguages,
            titlePreview: getFinalTitle(),
            availableTime: ariaNgCommonService.getTimeOptions([1000, 2000, 3000, 5000, 10000, 30000, 60000], true),
            trueFalseOptions: [{name: 'True', value: true}, {name: 'False', value: false}],
            showRpcSecret: false,
            settings: ariaNgSettingService.getAllOptions(),
            sessionSettings: ariaNgSettingService.getAllSessionOptions(),
            rpcSettings: ariaNgSettingService.getAllRpcSettings()
        };

        $scope.context.showDebugMode = $scope.context.sessionSettings.debugMode || extendType === 'debug';

        $scope.changeGlobalTab = function () {
            $scope.context.currentTab = 'global';
        };

        $scope.isCurrentGlobalTab = function () {
            return $scope.context.currentTab === 'global';
        };

        $scope.changeRpcTab = function (rpcIndex) {
            $scope.context.currentTab = 'rpc' + rpcIndex;
        };

        $scope.isCurrentRpcTab = function (rpcIndex) {
            return $scope.context.currentTab === 'rpc' + rpcIndex;
        };

        $scope.updateTitlePreview = function () {
            $scope.context.titlePreview = getFinalTitle();
        };

        $rootScope.swipeActions.extentLeftSwipe = function () {
            var tabIndex = -1;

            if (!$scope.isCurrentGlobalTab()) {
                tabIndex = parseInt($scope.context.currentTab.substring(3));
            }

            if (tabIndex < $scope.context.rpcSettings.length - 1) {
                $scope.changeRpcTab(tabIndex + 1);
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extentRightSwipe = function () {
            var tabIndex = -1;

            if (!$scope.isCurrentGlobalTab()) {
                tabIndex = parseInt($scope.context.currentTab.substring(3));
            }

            if (tabIndex > 0) {
                $scope.changeRpcTab(tabIndex - 1);
                return true;
            } else if (tabIndex === 0) {
                $scope.changeGlobalTab();
                return true;
            } else {
                return false;
            }
        };

        $scope.settingService = ariaNgSettingService;

        $scope.addNewRpcSetting = function () {
            var newRpcSetting = ariaNgSettingService.addNewRpcSetting();
            $scope.context.rpcSettings.push(newRpcSetting);

            $scope.changeRpcTab($scope.context.rpcSettings.length - 1);
        };

        $scope.updateRpcSetting = function (setting, field) {
            ariaNgSettingService.updateRpcSetting(setting, field);
        };

        $scope.removeRpcSetting = function (setting) {
            ariaNgCommonService.confirm('Confirm Remove', 'Are you sure you want to remove this rpc setting?', 'warning', function () {
                var index = $scope.context.rpcSettings.indexOf(setting);
                ariaNgSettingService.removeRpcSetting(setting);
                $scope.context.rpcSettings.splice(index, 1);

                if (index >= $scope.context.rpcSettings.length) {
                    $scope.changeRpcTab($scope.context.rpcSettings.length - 1);
                }
            });
        };

        $scope.setDefaultRpcSetting = function (setting) {
            if (setting.isDefault) {
                return;
            }

            ariaNgSettingService.setDefaultRpcSetting(setting);
            $window.location.reload();
        };

        $scope.isSupportNotification = function () {
            return ariaNgNotificationService.isSupportBrowserNotification() &&
                ariaNgSettingService.isCurrentRpcUseWebSocket($scope.context.settings.protocol);
        };

        $scope.setEnableBrowserNotification = function (value) {
            ariaNgSettingService.setBrowserNotification(value);

            if (value && !ariaNgNotificationService.hasBrowserPermission()) {
                ariaNgNotificationService.requestBrowserPermission(function (permission) {
                    if (!ariaNgNotificationService.isPermissionGranted(permission)) {
                        $scope.context.settings.browserNotification = false;
                        ariaNgCommonService.showError('You have disabled notification in your browser. You should change your browser\'s settings before you enable this function.');
                    }
                });
            }
        };

        $('[data-toggle="popover"]').popover();

        $rootScope.loadPromise = $timeout(function () {}, 100);
    }]);
}());
