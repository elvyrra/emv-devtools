'use strict';

// The function is executed in the context of the inspected page.
var pluginTitle="EMV context";

function getEMVInfo(el) {
    var EMV = window.EMV;
    if(!EMV) {
        if(typeof window.require === 'function' && require.defined) {
            try {
                if(require.defined('emv')) {
                    EMV = require('emv');
                }
            }
            catch(e) {}

            if(!EMV) {
                try {
                    if(require.defined('EMV')) {
                        EMV = require('EMV');
                    }
                }
                catch(e){}
            }
        }
        if(!EMV) {
            return {
                error : 'EMV is not loaded in this page'
            };
        }
    }

    let element = el;

    while(!element.$context && element.parentNode) {
        element = element.parentNode;
    }

    const context = element.$context;
    const result = context.valueOf();

    window.$context = result;

    result.$root = Object.assign({}, context.$root);
    result.$parent = Object.assign({}, context.$parent);

    if(context.$index !== undefined) {
        result.$index = context.$index;
    }

    return result;
};

chrome.devtools.panels.elements.createSidebarPane(pluginTitle,function(sidebar) {
    function updateElementProperties() {
        sidebar.setExpression('(' + getEMVInfo.toString() + ')($0)');
    }

    //attach to chrome events so that the sidebarPane refreshes (contains up to date info)
    chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
    sidebar.onShown.addListener(updateElementProperties);

    //listen to a message send by the background page (when the chrome windows's focus changes)
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        updateElementProperties();
    });
});

