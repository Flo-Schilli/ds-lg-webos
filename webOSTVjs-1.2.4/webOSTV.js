/**
 * Minimal webOS TV API wrapper
 * This is a simplified version for Digital Signage application
 */

(function(window) {
    'use strict';
    
    var webOS = {
        /**
         * Get device information
         */
        deviceInfo: function(successCallback, failureCallback) {
            try {
                // Try to use the native webOS API if available
                if (window.WebOSServiceBridge) {
                    var bridge = new WebOSServiceBridge();
                    var url = 'luna://com.webos.service.systemservice/deviceInfo/query';
                    var params = '{}';

                    bridge.onservicecallback = function(inResponse) {
                        var response = typeof inResponse === 'string' ? JSON.parse(inResponse) : inResponse;
                        if (response.returnValue) {
                            successCallback({
                                modelName: response.device_name || 'LG-WebOS-TV',
                                serialNumber: response.serial_number,
                                deviceId: response.device_id,
                                ethernet_mac: response.wired_addr,
                                wifi_mac: response.wifi_addr
                            });
                        } else {
                            failureCallback(response);
                        }
                    };

                    bridge.call(url, params);
                } else if (window.PalmSystem && window.PalmServiceBridge) {
                    var request = window.PalmServiceBridge.call(
                        'luna://com.webos.service.tv.systemproperty',
                        'getSystemInfo',
                        '{}'
                    );
                    
                    request.onservicecallback = function(inResponse) {
                        var response = typeof inResponse === 'string' ? JSON.parse(inResponse) : inResponse;
                        if (response.returnValue) {
                            successCallback({
                                modelName: response.modelName || 'LG-WebOS-TV',
                                serialNumber: response.serialNumber
                            });
                        } else {
                            failureCallback(response);
                        }
                    };
                } else {
                    // Fallback for development/testing
                    successCallback({
                        modelName: 'LG-WebOS-TV'
                    });
                }
            } catch (error) {
                if (failureCallback) {
                    failureCallback(error);
                }
            }
        },
        
        /**
         * Platform information
         */
        platform: {
            tv: true
        },
        
        /**
         * Get platform version
         */
        platformVersion: function() {
            return '6.0';
        }
    };
    
    // Export to global scope
    window.webOS = webOS;
    
})(window);
