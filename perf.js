(function() {
  var AESEncryptor, Bench, DropHandler, ReadHandler;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AESEncryptor = (function() {
    function AESEncryptor() {}
    AESEncryptor.prototype.encrypt_sjcl = function(plaintext) {
      var encrypted_data;
      if (typeof plaintext !== 'string') {
        plaintext = sjcl.codec.bytes.toBits(plaintext);
      }
      return encrypted_data = sjcl.encrypt('f76e9d3884236', plaintext);
    };
    AESEncryptor.prototype.encrypt_forge = function(plaintext) {
      var encrypted_data;
      return encrypted_data = forge.encrypt('f76e9d3884236', data);
    };
    AESEncryptor.prototype.encrypt_forge_parts = function(plaintext, cb) {};
    AESEncryptor.prototype.encrypt_clipperz = function(data) {
      var clipped_data, encrypted_data, key, keyvalue, nonce;
      keyvalue = new Clipperz.ByteArray("0x00010203050607080a0b0c0d0f10111214151617191a1b1c1e1f202123242526");
      nonce = new Clipperz.ByteArray("0x50515253555657585a5b5c5d5f60616264656667696a6b6c6e6f707173747576");
      key = new Clipperz.Crypto.AES.Key({
        key: keyvalue
      });
      clipped_data = new Clipperz.ByteArray(data);
      encrypted_data = new Clipperz.ByteArray(Clipperz.Crypto.AES.encryptBlocks(key, clipped_data.arrayValues(), nonce));
      return window.encrypted_data = encrypted_data;
    };
    AESEncryptor.prototype.encrypt_gibberish = function(data) {
      var encrypted_data;
      return encrypted_data = GibberishAES.enc(data, 'f76e9d3884236');
    };
    return AESEncryptor;
  })();
  Bench = (function() {
    function Bench() {
      this.runSync = __bind(this.runSync, this);
    }
    Bench.prototype.runSync = function(name, tested) {
      var bench, mean, results;
      bench = new Benchmark('bench-name', tested, {
        maxTime: 30
      });
      results = bench.run();
      mean = results.stats.mean.toPrecision(5);
      return console.log("" + name + ", " + mean + " seconds");
    };
    return Bench;
  })();
  ReadHandler = (function() {
    function ReadHandler(file) {
      this.onError = __bind(this.onError, this);
      this.onRead = __bind(this.onRead, this);      this.bench = new Bench;
      this.encryptor = new AESEncryptor;
      this.reader = new FileReader();
      this.reader.onload = this.onRead;
      this.reader.onerror = this.onError;
      this.reader.readAsArrayBuffer(file);
    }
    ReadHandler.prototype.onRead = function(read_evt) {
      var cipher, data, iv, key, read_file;
      window.read_evt = read_evt;
      read_file = read_evt.target;
      data = read_file.result;
      /*    
      acompressed_data = Iuppiter.compress(data)
      
      @bench.runSync 'compression-only', =>
        compressed_data = Iuppiter.compress(data)
        
      @bench.runSync 'encryption-only', =>
        @encryptor.encrypt_sjcl acompressed_data
      
      @bench.runSync 'encryption-compression', =>
        compressed_data = Iuppiter.compress(data)
        @encryptor.encrypt_sjcl compressed_data
      
      */
      iv = forge.random.getBytes(128 / 8);
      key = forge.random.getBytes(256 / 8);
      cipher = forge.aes.startEncrypting(key, iv);
      cipher.start();
      return this.bench.runSync('encyption-compression-forge', __bind(function() {
        var compressed, compressed_buffer, int8, _i, _len;
        compressed = Iuppiter.compress(data);
        compressed_buffer = new forge.util.ByteBuffer();
        for (_i = 0, _len = compressed.length; _i < _len; _i++) {
          int8 = compressed[_i];
          compressed_buffer.putInt8(int8);
        }
        cipher.update(compressed_buffer);
        return cipher.finish();
      }, this));
    };
    ReadHandler.prototype.onError = function() {
      return $('#error').text("Sorry, but something went wrong. Error code: " + this.reader.error.code);
    };
    return ReadHandler;
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
      console.log("A new file named " + file.name + " that is " + file.size + " bytes in size was dropped!");
      return handler = new ReadHandler(file);
    };
    window.onload = function() {
      var setupApplication;
      return (setupApplication = function() {
        var element;
        element = document.getElementById('playingField');
        return new DropHandler(element);
      })();
    };
    return DropHandler;
  })();
}).call(this);
