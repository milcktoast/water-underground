#!/bin/sh
java -jar compiler/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ../js/RequestAnimationFrame.js ../src/wugThree.js ../src/wugScene.js ../src/wugModel.js ../src/wugController.js --js_output_file ../WaterUnderground.min.js
