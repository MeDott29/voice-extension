(()=>{const e=new class{constructor(){this.mediaRecorder=null,this.audioChunks=[],this.stream=null}async startRecording(){try{return this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),this.audioChunks=[],this.mediaRecorder=new MediaRecorder(this.stream),this.mediaRecorder.ondataavailable=e=>{e.data.size>0&&this.audioChunks.push(e.data)},this.mediaRecorder.start(1e3),{success:!0}}catch(e){return console.error("Error starting recording:",e),{success:!1,error:e.message||"Failed to start recording"}}}stopRecording(){return this.mediaRecorder&&"inactive"!==this.mediaRecorder.state&&this.mediaRecorder.stop(),this.stream&&(this.stream.getTracks().forEach((e=>e.stop())),this.stream=null),{success:!0}}};chrome.runtime.onMessage.addListener(((s,r,t)=>{if("PING"!==s.type){if("START_RECORDING"===s.type)return e.startRecording().then(t),!0;if("STOP_RECORDING"===s.type)return t(e.stopRecording()),!1}else t({success:!0})}))})();