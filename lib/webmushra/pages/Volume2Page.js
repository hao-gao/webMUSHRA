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

  this.freq = 1000;
  this.biquadFilter = this.audioContext.createBiquadFilter();
  this.biquadFilter.type = "bandpass";
  this.biquadFilter.frequency.setValueAtTime(this.freq, this.audioContext.currentTime);
  this.biquadFilter.Q.setValueAtTime(10, this.audioContext.currentTime);

  this.splitter = this.audioContext.createChannelSplitter(2);
  this.merger = this.audioContext.createChannelMerger(2);
  this.volR = 0.5;
  this.gainNodeR = this.audioContext.createGain();
  this.gainNodeR.gain.setValueAtTime(this.volR, this.audioContext.currentTime);
  this.volL = 0.5;
  this.gainNodeL = this.audioContext.createGain();
  this.gainNodeL.gain.setValueAtTime(this.volL, this.audioContext.currentTime);

  this.dlyR = 0;
  this.delayNodeR = this.audioContext.createDelay();
  this.delayNodeR.delayTime.setValueAtTime(this.dlyR, this.audioContext.currentTime);
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
  this.splitter.connect(this.gainNodeR, 1);
  this.splitter.connect(this.gainNodeL, 0);
  // Connect the splitter back to the second input of the merger: we
  // effectively swap the channels, here, reversing the stereo image.
  this.gainNodeR.connect(this.delayNodeR);
  this.delayNodeR.connect(this.merger, 0, 1);
  this.gainNodeL.connect(this.merger, 0, 0);
  this.merger.connect(this.audioContext.destination);
};

Volume2Page.prototype.save = function() {
  this.volume = this.audioContext.volume;
  this.filePlayer.free();
};

Volume2Page.prototype.gainVolume = function(value) {
  this.audioContext.volume = parseInt(value, 10) / 100.0;
};

Volume2Page.prototype.gainFreq = function(value) {
  this.freq = parseInt(value, 10);
  this.biquadFilter.frequency.setValueAtTime(this.freq, this.audioContext.currentTime);
};

Volume2Page.prototype.changeVolR = function(value) {
  this.volR = parseInt(value, 10)/100.0;
  this.gainNodeR.gain.setValueAtTime(this.volR, this.audioContext.currentTime);
};
Volume2Page.prototype.changeVolL = function(value) {
  this.volL = parseInt(value, 10)/100.0;
  this.gainNodeL.gain.setValueAtTime(this.volL, this.audioContext.currentTime);
};
Volume2Page.prototype.changeDlyR = function(value) {
  this.dlyR = parseInt(value, 10)/1000.0;
  this.delayNodeR.delayTime.setValueAtTime(this.dlyR, this.audioContext.currentTime);
};

Volume2Page.prototype.render = function (_parent) {
  var content = $(" <p> " + this.pageConfig.content + " </p>");
  var slider = $("<table width='600' style='margin: 0 auto;'></table>");
  slider.append($("<p>Volume:</p>"));
  slider.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<input type="range" name="slider"  min="0" max="100" value="'+ this.volume * 100 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.gainVolume(this.value)">')
      )
    )
  );
  var slider2 = $("<table width='600' style='margin: 0 auto;'></table>");
  slider2.append($("<p>Volume of the left channel:</p>"));
  slider2.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<input type="range" name="slider"  min="0" max="100" value="'+ this.volL*100 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeVolL(this.value)">')
      )
    )
  );
  var slider3 = $("<table width='600' style='margin: 0 auto;'></table>");
  slider3.append($("<p>Volume of the right channel:</p>"));
  slider3.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<input type="range" name="slider"  min="0" max="100" value="'+ this.volR*100 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeVolR(this.value)">')
      )
    )
  );
  var slider4 = $("<table width='600' style='margin: 0 auto;'></table>");
  slider4.append($("<p>Delay of the right channel [ms]:</p>"));
  slider4.append(
    $('<tr></tr>').append(
      $('<td></td>').append(
        $('<input type="range" name="slider"  min="0" max="100" step="0.1" value="'+ this.dlyR*1000 +'"  data-highlight="true" onchange = "' + this.pageManager.getPageVariableName(this) + '.changeDlyR(this.value)">')
      )
    )
  );
  _parent.append(content);
  this.filePlayer.render(_parent);
  _parent.append(slider); 
  _parent.append(slider2);
  _parent.append(slider3); 
  _parent.append(slider4);
};
