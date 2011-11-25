(function() {
  var AESEncryptor, Bench, DropHandler, ReadHandler;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AESEncryptor = (function() {
    function AESEncryptor() {}
    AESEncryptor.prototype.encrypt = function(data) {
      var encrypted_data;
      return encrypted_data = sjcl.encrypt('f76e9d3884236', data);
    };
    AESEncryptor.prototype.decrypt = function(data) {};
    return AESEncryptor;
  })();
  Bench = (function() {
    function Bench() {
      this.output = $('#benchResults');
    }
    Bench.prototype.runSync = function(tested) {
      var bench, mean, results, sample_size;
      bench = new Benchmark('aes-test', tested, {
        maxTime: 20
      });
      results = bench.run();
      mean = results.stats.mean.toPrecision(5);
      sample_size = results.stats.size;
      if (sample_size > 1) {
        return this.output.text("Mean running time was: " + mean + " seconds, with sample size of " + sample_size);
      } else {
        return this.output.text("Ran test once (large file was given) and running time was: " + mean + " seconds");
      }
    };
    return Bench;
  })();
  ReadHandler = (function() {
    function ReadHandler(file) {
      this.onError = __bind(this.onError, this);
      this.onRead = __bind(this.onRead, this);
      this.handleData = __bind(this.handleData, this);      this.bench = new Bench;
      this.encryptor = new AESEncryptor;
      this.reader = new FileReader();
      this.reader.onload = this.onRead;
      this.reader.onerror = this.onError;
      this.reader.readAsBinaryString(file);
    }
    ReadHandler.prototype.handleData = function(data) {
      return this.encryptor.encrypt(data);
    };
    ReadHandler.prototype.onRead = function(read_evt) {
      var read_file;
      window.read_evt = read_evt;
      read_file = read_evt.target;
      return this.bench.runSync(__bind(function() {
        return this.handleData(read_file.result);
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
      $('#fileDetails').text("A new file named " + file.name + " that is " + file.size + " bytes in size was dropped!");
      return handler = new ReadHandler(file);
    };
    return DropHandler;
  })();
  $(document).ready(function() {
    var setupApplication;
    return (setupApplication = function() {
      var element;
      element = document.getElementById('playingField');
      return new DropHandler(element);
    })();
  });
}).call(this);
