const Cu = Components.utils;
const Ci = Components.interfaces;


let Scheduler = {
  _lastTick: null,
  _speed: 1,
  _targetTime: 0,
  _isPaused: false,

  tick: function(timestamp) {
    if (this._destroyed) {
      return;
    }
    let now = timestamp;
    let delta = now - this._lastTick;
    delta *= this._speed;
    this._lastTick = now;
    if (!this._isPaused) {
      this.wUtils.advanceTimeAndRefresh(delta);
      this._targetTime += delta;
      this.emit("update");
    }
    this.masterWindow.mozRequestAnimationFrame(this.tick);
  },

  init: function(target, masterWindow) {
    let targetWindow = target.tab.linkedBrowser.contentWindow;
    if (targetWindow === masterWindow) {
      throw new Error("Same windows");
    }
    this.tick = this.tick.bind(this);
    this.masterWindow = masterWindow;
    this.wUtils = targetWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
    this.wUtils.advanceTimeAndRefresh(0);
    this._lastTick = masterWindow.mozAnimationStartTime;
    this.masterWindow.mozRequestAnimationFrame(this.tick);
    this.emit("play");
  },

  destroy: function() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this.wUtils.restoreNormalRefresh();
    this.wUtils = null;
    this.masterWindow = null;
  },

  resetStartTime: function() {
    this._targetTime = 0;
    this.emit("update");
  },

  getTargetTime: function(modulo) {
    let time = Math.round(this._targetTime % modulo);
    let ms = time % 1000;
    time -= ms;
    s = time / 1000;
    return s + "s:" + ms + "ms";
  },

  pause: function() {
    this._isPaused = true;
    this.emit("pause");
  },

  play: function() {
    this._isPaused = false;
    this.emit("play");
  },

  pauseAndStep: function(value) {
    this.pause();
    if (!Number.isInteger(value)) {
      return;
    }
    this.wUtils.advanceTimeAndRefresh(value);
    this._targetTime += value;
    this.emit("update");
  },

  setSpeed: function(value) {
    if (!(typeof value == "number") || Number.isNaN(value)) {
      return false;
    }
    this._speed = value;
    this.emit("speed-update");
    return true;
  },
}

Cu.import("resource:///modules/devtools/EventEmitter.jsm");
EventEmitter.decorate(Scheduler);
