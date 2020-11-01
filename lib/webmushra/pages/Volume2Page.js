/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function Volume2Page(_pageManager, _audioContext, _audioFileLoader, _pageConfig, _bufferSize, _errorHandler, _language) {
  this.pageManager = _pageManager;
  this.audioContext = _audioContext;
  this.audioFileLoader = _audioFileLoader;
  this.pageConfig = _pageConfig;
  this.bufferSize = _bufferSize;
  this.errorHandler = _errorHandler;
  this.language = _language;
  this.fpc = null;  
  this.played = false;

  this.stimulus = new Stimulus("stimulus", _pageConfig.stimulus);

  this.audioFileLoader.addFile(this.pageConfig.stimulus, (function (_buffer, _stimulus) { _stimulus.setAudioBuffer(_buffer); }), this.stimulus);
  this.filePlayer = null;
  
  if (this.pageConfig.defaultVolume === undefined)
    this.pageConfig.defaultVolume = 0;
    
  this.audioContext.volume = this.volume = this.pageConfig.defaultVolume; 

  this.splitter = this.audioContext.createChannelSplitter(4);
  this.merger = this.audioContext.createChannelMerger(4);
  this.sw0 = 1;
  this.gainNode00 = this.audioContext.createGain();
  this.gainNode00.gain.setValueAtTime(this.sw0, this.audioContext.currentTime);
  this.sw1 = 0;
  this.gainNode10 = this.audioContext.createGain();
  this.gainNode10.gain.setValueAtTime(this.sw1, this.audioContext.currentTime);
  this.sw2 = 0;
  this.gainNode20 = this.audioContext.createGain();
  this.gainNode20.gain.setValueAtTime(this.sw2, this.audioContext.currentTime);
  this.sw3 = 0;
  this.gainNode30 = this.audioContext.createGain();
  this.gainNode30.gain.setValueAtTime(this.sw3, this.audioContext.currentTime);

  this.vol0 = 1;
  this.gainNode0 = this.audioContext.createGain();
  this.gainNode0.gain.setValueAtTime(this.vol0, this.audioContext.currentTime);
  this.vol1 = 1;
  this.gainNode1 = this.audioContext.createGain();
  this.gainNode1.gain.setValueAtTime(this.vol1, this.audioContext.currentTime);
  this.vol2 = 1;
  this.gainNode2 = this.audioContext.createGain();
  this.gainNode2.gain.setValueAtTime(this.vol2, this.audioContext.currentTime);
  this.vol3 = 1;
  this.gainNode3 = this.audioContext.createGain();
  this.gainNode3.gain.setValueAtTime(this.vol3, this.audioContext.currentTime);
}

Volume2Page.prototype.init = function (_callbackError) {
  this.filePlayer = new FilePlayer(this.audioContext, this.bufferSize, [this.stimulus], this.errorHandler, this.language, this.pageManager.getLocalizer()); 
  
  this.filePlayer.genericAudioControl.addEventListener((function (_event) {
    if (_event.name == 'ended') {
      setTimeout((function(){this.filePlayer.genericAudioControl.play(_event.index)}).bind(this),1);
      //setTimeout((function(){alert(typeof this.freq)}).bind(this),1000);
    } 
  }).bind(this));
};


Volume2Page.prototype.getName = function () {
  return this.pageConfig.name;
};

Volume2Page.prototype.load = function() {
  this.filePlayer.init(); 
  this.filePlayer.genericAudioControl.scriptNode.disconnect();
  //this.filePlayer.genericAudioControl.scriptNode.connect(this.audioContext.destination);
  //this.filePlayer.genericAudioControl.scriptNode.connect(this.biquadFilter).connect(this.audioContext.destination);
  this.filePlayer.genericAudioControl.scriptNode.connect(this.splitter);
  this.splitter.connect(this.gainNode0, 0).connect(this.gainNode00);
  this.splitter.connect(this.gainNode1, 0).connect(this.gainNode10);
  this.splitter.connect(this.gainNode2, 0).connect(this.gainNode20);
  this.splitter.connect(this.gainNode3, 0).connect(this.gainNode30);
  this.gainNode00.connect(this.merger, 0, 0);
  this.gainNode10.connect(this.merger, 0, 1);
  this.gainNode20.connect(this.merger, 0, 2);
  this.gainNode30.connect(this.merger, 0, 3);
  this.merger.connect(this.audioContext.destination);
};

Volume2Page.prototype.save = function() {
  this.volume = this.audioContext.volume;
  this.filePlayer.free();
};

Volume2Page.prototype.gainVolume = function(value) {
  this.audioContext.volume = parseInt(value, 10) / 100.0;
};

Volume2Page.prototype.changeSw0 = function() {
  if (this.sw0 == 0){
    this.sw0 = 1;
    this.sw1 = this.sw2 = this.sw3 = 0;
  }
  this.setSwValue();
};
Volume2Page.prototype.changeSw1 = function(value) {
  if (this.sw1 == 0){
    this.sw1 = 1;
    this.sw0 = this.sw2 = this.sw3 = 0;
  }
  this.setSwValue();
};
Volume2Page.prototype.changeSw2 = function(value) {
  if (this.sw2 == 0){
    this.sw2 = 1;
    this.sw1 = this.sw0 = this.sw3 = 0;
  }
  this.setSwValue();
};
Volume2Page.prototype.changeSw3 = function(value) {
  if (this.sw3 == 0){
    this.sw3 = 1;
    this.sw1 = this.sw2 = this.sw0 = 0;
  }
  this.setSwValue();
};
Volume2Page.prototype.setSwValue = function() {
  this.gainNode00.gain.setValueAtTime(this.sw0, this.audioContext.currentTime);
  this.gainNode10.gain.setValueAtTime(this.sw1, this.audioContext.currentTime);
  this.gainNode20.gain.setValueAtTime(this.sw2, this.audioContext.currentTime);
  this.gainNode30.gain.setValueAtTime(this.sw3, this.audioContext.currentTime);
};

Volume2Page.prototype.changeVol0 = function(value) {
  this.vol0 = parseFloat(value);
  this.gainNode0.gain.setValueAtTime(this.vol0, this.audioContext.currentTime);
};
Volume2Page.prototype.changeVol1 = function(value) {
  this.vol1 = parseFloat(value);
  this.gainNode1.gain.setValueAtTime(this.vol1, this.audioContext.currentTime);
};
Volume2Page.prototype.changeVol2 = function(value) {
  this.vol2 = parseFloat(value);
  this.gainNode2.gain.setValueAtTime(this.vol2, this.audioContext.currentTime);
};
Volume2Page.prototype.changeVol3 = function(value) {
  this.vol3 = parseFloat(value);
  this.gainNode3.gain.setValueAtTime(this.vol3, this.audioContext.currentTime);
};

Volume2Page.prototype.render = function (_parent) {
  var content = $(" <p> " + this.pageConfig.content + " </p>");
  var slider = $("<table width='600' style='margin: 0 auto;'></table>");
  slider.append($("<p>Number of channels:"+this.audioContext.destination.channelCount+"</p>"));
  // slider.append($("<p>Volume:</p>"));
  // slider.append(
  //   $('<tr></tr>').append(
  //     $('<td></td>').append(
  //       $('<input type="range" name="slider"  min="0" max="100" value="'+ this.volume * 100 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.gainVolume(this.value)">')
  //     )
  //   )
  // );
  var slider0 = $("<table width='600' style='margin: 0 auto;'></table>");
  // slider0.append($("<p>Channel 0:</p>"));
  slider0.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<button data-role="button" onclick="' + this.pageManager.getPageVariableName(this) + '.changeSw0(this.value)">Switch to channel 1</button>'),
        $('<input type="range" name="slider"  min="0" max="1" step="0.002" value="'+ this.vol0 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeVol0(this.value)">')
      )
    )
  );
  var slider1 = $("<table width='600' style='margin: 0 auto;'></table>");
  // slider1.append($("<p>Channel 1:</p>"));
  slider1.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<button data-role="button" onclick="' + this.pageManager.getPageVariableName(this) + '.changeSw1(this.value)">Switch to channel 2</button>'),
        $('<input type="range" name="slider"  min="0" max="1" step="0.002" value="'+ this.vol1 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeVol1(this.value)">')
      )
    )
  );
  var slider2 = $("<table width='600' style='margin: 0 auto;'></table>");
  // slider2.append($("<p>Channel 2:</p>"));
  slider2.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<button data-role="button" onclick="' + this.pageManager.getPageVariableName(this) + '.changeSw2(this.value)">Switch to channel 3</button>'),
        $('<input type="range" name="slider"  min="0" max="1" step="0.002" value="'+ this.vol2 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeVol2(this.value)">')
      )
    )
  );
  var slider3 = $("<table width='600' style='margin: 0 auto;'></table>");
  // slider3.append($("<p>Channel 3:</p>"));
  slider3.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<button data-role="button" onclick="' + this.pageManager.getPageVariableName(this) + '.changeSw3(this.value)">Switch to channel 4</button>'),
        $('<input type="range" name="slider"  min="0" max="1" step="0.002" value="'+ this.vol3 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeVol3(this.value)">')
      )
    )
  );
  _parent.append(content);
  this.filePlayer.render(_parent);
  _parent.append(slider); 
  _parent.append(slider0); 
  _parent.append(slider1);
  _parent.append(slider2); 
  _parent.append(slider3);
};
