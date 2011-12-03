(function() {
  var DropHandler, FileHandler;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  FileHandler = (function() {
    function FileHandler(file) {
      var blob, block_size, block_stop, cipher, iv, key, old, queue, slice_index;
      block_size = 1024 * 512;
      slice_index = 0;
      blob = 0;
      iv = forge.random.getBytes(128 / 8);
      key = forge.random.getBytes(256 / 8);
      cipher = forge.aes.startEncrypting(key, iv);
      queue = $.jqmq({
        delay: -1,
        batch: 1,
        callback: function(range) {
          var reader;
          reader = new FileReader;
          reader.onloadend = function(evt) {
            var buffer, int8, plaintext, _i, _len, _ref;
            plaintext = evt.target.result;
            if (plaintext == null) {
              return;
            }
            if (evt.target.readyState === FileReader.DONE) {
              buffer = new forge.util.ByteBuffer();
              _ref = new Uint8Array(plaintext);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                int8 = _ref[_i];
                buffer.putInt8(int8);
              }
              cipher.update(buffer);
              queue.next();
              return false;
            }
          };
          if (file.webkitSlice != null) {
            blob = file.webkitSlice(range.start, range.stop + 1);
            return reader.readAsArrayBuffer(blob);
          } else if (file.mozSlice != null) {
            blob = file.mozSlice(range.start, range.stop + 1);
            return reader.readAsArrayBuffer(blob);
          }
        },
        complete: function() {
          var now;
          now = new Date();
          cipher.finish();
          console.log("This is the length of the finalx read encrypted block: " + (cipher.output.getBytes(cipher.output.length()).length));
          console.log("All file handling is done, it took: " + ((now - old) / 1000) + " seconds");
          $('#benchResults').text("All file handling is done, it took: " + ((now - old) / 1000) + " seconds");
          return false;
        }
      });
      old = new Date();
      queue.start();
      while (slice_index < file.size) {
        if ((file.size - slice_index) > block_size) {
          block_stop = slice_index + block_size;
        } else {
          block_stop = file.size;
        }
        queue.add({
          start: slice_index,
          stop: block_stop
        });
        slice_index += block_size;
      }
    }
    return FileHandler;
  })();
  DropHandler = (function() {
    function DropHandler(element) {
      this.onDrop = __bind(this.onDrop, this);      element.addEventListener('drop', this.onDrop, false);
      element.addEventListener('dragenter', this.handleOnOurOwn, false);
      element.addEventListener('dragover', this.handleOnOurOwn, false);
      element.addEventListener('dragleave', this.handleOnOurOwn, false);
    }
    DropHandler.prototype.handleOnOurOwn = function(evt) {
      evt.stopPropagation();
      return evt.preventDefault();
    };
    DropHandler.prototype.onDrop = function(evt) {
      var file, handler;
      this.handleOnOurOwn(evt);
      file = evt.dataTransfer.files[0];
      $('#benchResults').text('');
      console.log("A new file named " + file.name + " that is " + file.size + " bytes in size was dropped!");
      $('#fileDetails').text("A new file named " + file.name + " that is " + file.size + " bytes in size was dropped!");
      return handler = new FileHandler(file);
    };
    return DropHandler;
  })();
  window.onload = function() {
    var setupApplication;
    return (setupApplication = function() {
      var element;
      element = document.getElementById('playingField');
      return new DropHandler(element);
    })();
  };
}).call(this);
