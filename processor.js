
// processor.js
// This file is evaluated in the audio rendering thread
// upon context.audioWorklet.addModule() call.

class Processor extends AudioWorkletProcessor {
  process([input], [output]) {
    // Copy inputs to outputs.
    output[0].set(input[0]);
    return true;
  }
}

registerProcessor("processor", Processor);