const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/devtools/gDevTools.jsm");

/* Depending on the version of Firefox, promise module can have different path */
try { Cu.import("resource://gre/modules/commonjs/promise/core.js"); } catch(e) {}
try { Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js"); } catch(e) {}

XPCOMUtils.defineLazyGetter(this, "osString", function() Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS);

const animClockProps = "chrome://animclock/locale/animClock.properties";
let animClockStrings = Services.strings.createBundle(animClockProps);

let animClockDefinition = {
  id: "animationclock",
  ordinal: 5,
  url: "chrome://animclock/content/panel.xhtml",
  label: animClockStrings.GetStringFromName("animClock.label"),
  tooltip: animClockStrings.GetStringFromName("animClock.tooltip"),
  isTargetSupported: function(target) {
    return target.isLocalTab;
  },
  build: function(iframeWindow, toolbox) {
    let s = iframeWindow.Scheduler;
    s.init(toolbox.target, iframeWindow);
    return Promise.resolve(s);
  }
};

function startup() {
  gDevTools.registerTool(animClockDefinition);
}

function shutdown() {
  gDevTools.unregisterTool(animClockDefinition);
}

function install() {}
function uninstall() {}
